import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { SessionProvider, useSession } from "../auth/session";
import { chatApi } from "./api";
import { RoomPage } from "../../pages/RoomPage";

const fetchMock = vi.fn<typeof fetch>();
const first = { id: 1, symbol: "QQQ", authorId: 7, content: "첫 의견", createdAt: "2026-11-02T09:00:00Z" };
const second = { ...first, id: 2, content: "새 의견" };
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data, error: null }), {
  status: 200, headers: { "Content-Type": "application/json" },
});

function LoginFixture() {
  const { login } = useSession();
  return <button onClick={() => login({ accessToken: "signed-test-token", tokenType: "Bearer", expiresInSeconds: 3600 })}>시험 로그인</button>;
}

function page(withLogin = false) {
  return render(<MemoryRouter initialEntries={["/rooms/QQQ"]}><SessionProvider>
    {withLogin && <LoginFixture />}
    <Routes><Route path="/rooms/:symbol" element={<RoomPage />} /></Routes>
  </SessionProvider></MemoryRouter>);
}

beforeEach(() => {
  vi.stubEnv("VITE_CHAT_ENABLED", "true");
  vi.stubEnv("VITE_CHAT_API_BASE_URL", "https://api.example.invalid/api/v1/finance/rooms");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

test("익명 사용자는 메시지를 읽지만 글쓰기 대신 로그인을 안내한다", async () => {
  fetchMock.mockResolvedValue(ok([first]));
  page();
  expect(await screen.findByText("첫 의견")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  expect(screen.queryByRole("button", { name: "게시하기" })).not.toBeInTheDocument();
  expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.invalid/api/v1/finance/rooms/QQQ/messages");
});

test("로그인 회원의 글은 토큰과 재시도 ID를 보내고 저장된 결과만 보인다", async () => {
  fetchMock.mockImplementation(async (_url, init) => init?.method === "POST" ? ok(second) : ok([first]));
  page(true);
  await screen.findByText("첫 의견");
  fireEvent.click(screen.getByRole("button", { name: "시험 로그인" }));
  fireEvent.change(screen.getByLabelText("의견 쓰기"), { target: { value: "새 의견" } });
  fireEvent.click(screen.getByRole("button", { name: "게시하기" }));
  expect(await screen.findByText("새 의견")).toBeInTheDocument();
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
  expect(call?.[1]?.headers).toMatchObject({ Authorization: "Bearer signed-test-token" });
  expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ content: "새 의견", requestId: expect.any(String) });
  await waitFor(() => expect(screen.getAllByText("새 의견")).toHaveLength(1));
});

test("HTML 성공 응답과 다른 종목 메시지는 API 성공으로 받지 않는다", async () => {
  fetchMock.mockResolvedValueOnce(new Response("<html>fallback</html>", { status: 200 }));
  await expect(chatApi.list("QQQ")).rejects.toThrow("응답을 확인");
  fetchMock.mockResolvedValueOnce(ok([{ ...first, symbol: "SPY" }]));
  await expect(chatApi.list("QQQ")).rejects.toThrow("일치하지");
});

test("내 글을 저장해도 아직 읽지 않은 상대 글을 다음 조회에서 건너뛰지 않는다", async () => {
  let refresh: (() => void) | undefined;
  const originalInterval = window.setInterval.bind(window);
  vi.spyOn(window, "setInterval").mockImplementation((handler, timeout, ...args) => {
    if (timeout === 5000 && typeof handler === "function") {
      refresh = () => handler();
      return 123;
    }
    return originalInterval(handler, timeout, ...args);
  });
  const own = { ...first, id: 3, content: "내 답변" };
  fetchMock.mockImplementation(async (url, init) => {
    if (init?.method === "POST") return ok(own);
    if (String(url).endsWith("?afterId=1")) return ok([second, own]);
    if (String(url).includes("afterId=")) return ok([]);
    return ok([first]);
  });
  page(true);
  await screen.findByText("첫 의견");
  fireEvent.click(screen.getByRole("button", { name: "시험 로그인" }));
  fireEvent.change(screen.getByLabelText("의견 쓰기"), { target: { value: "내 답변" } });
  fireEvent.click(screen.getByRole("button", { name: "게시하기" }));
  await screen.findByText("내 답변");
  expect(refresh).toBeTypeOf("function");
  await act(async () => { refresh?.(); });
  expect(await screen.findByText("새 의견")).toBeInTheDocument();
  expect(screen.getAllByText("내 답변")).toHaveLength(1);
  expect(fetchMock.mock.calls.at(-1)?.[0]).toContain("?afterId=1");
  await act(async () => { refresh?.(); });
  await waitFor(() => expect(fetchMock.mock.calls.at(-1)?.[0]).toContain("?afterId=3"));
});
