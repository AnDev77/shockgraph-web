import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SessionProvider, useSession } from "../auth/session";
import { WatchlistPanel, WatchlistToggle } from "./Watchlist";
import { watchlistApi } from "./api";

const fetchMock = vi.fn<typeof fetch>();
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data, error: null }), {
  status: 200, headers: { "Content-Type": "application/json" },
});
function LoginFixture() {
  const { login } = useSession();
  return <button onClick={() => login({ accessToken: "test-token", tokenType: "Bearer", expiresInSeconds: 3600 })}>
    시험 로그인
  </button>;
}
function SwitchUserFixture() {
  const { login } = useSession();
  return <><button onClick={() => login({ accessToken: "first-token", tokenType: "Bearer", expiresInSeconds: 3600 })}>
    첫 계정
  </button><button onClick={() => login({ accessToken: "second-token", tokenType: "Bearer", expiresInSeconds: 3600 })}>
    다른 계정
  </button></>;
}
function page() {
  return render(<MemoryRouter><SessionProvider><LoginFixture />
    <WatchlistToggle symbol="QQQ" /><WatchlistPanel />
  </SessionProvider></MemoryRouter>);
}
beforeEach(() => {
  vi.stubEnv("VITE_WATCHLIST_ENABLED", "true");
  vi.stubEnv("VITE_WATCHLIST_API_BASE_URL", "https://api.example.invalid/api/v1/watchlist");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

test("로그인 전에는 목록을 요청하지 않고 로그인 안내를 한다", () => {
  page();
  expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("QQQ 저장·제거 결과를 표시하고 내 목록을 연결한다", async () => {
  fetchMock.mockImplementation(async (_url, init) => {
    if (init?.method === "PUT") return ok(["QQQ"]);
    if (init?.method === "DELETE") return ok([]);
    return ok([]);
  });
  page();
  fireEvent.click(screen.getByRole("button", { name: "시험 로그인" }));
  await screen.findByText("아직 등록된 종목이 없습니다.");
  fireEvent.click(screen.getByRole("button", { name: "관심 종목에 추가" }));
  await screen.findByRole("button", { name: "관심 종목에서 제거" });
  const save = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT");
  expect(save?.[0]).toBe("https://api.example.invalid/api/v1/watchlist/QQQ");
  expect(save?.[1]?.headers).toMatchObject({ Authorization: "Bearer test-token" });
  fireEvent.click(screen.getByRole("button", { name: "관심 종목에서 제거" }));
  await screen.findByRole("button", { name: "관심 종목에 추가" });
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(true);
});

test("HTML 응답·미지원 종목·인증 실패를 목록 성공으로 취급하지 않는다", async () => {
  fetchMock.mockResolvedValueOnce(new Response("<html>fallback</html>", { status: 200 }));
  await expect(watchlistApi.list("test-token")).rejects.toThrow("응답을 확인");
  fetchMock.mockResolvedValueOnce(ok(["OTHER"]));
  await expect(watchlistApi.list("test-token")).rejects.toThrow("응답을 확인");
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, data: null, error: { code: "AUTH_008" } }),
    { status: 401 }));
  await expect(watchlistApi.list("test-token")).rejects.toThrow("로그인이 만료");
});

test("목록 연결 실패 시 저장 버튼을 잠가 실패를 보여준다", async () => {
  fetchMock.mockRejectedValue(new TypeError("network"));
  page();
  fireEvent.click(screen.getByRole("button", { name: "시험 로그인" }));
  await waitFor(() => expect(screen.getAllByRole("status")).toHaveLength(2));
  expect(screen.getByRole("button", { name: "관심 종목에 추가" })).toBeDisabled();
});

test("계정이 바뀌면 이전 계정의 관심 목록을 새 계정에 보여주지 않는다", async () => {
  fetchMock.mockImplementation(async (_url, init) => {
    const token = (init?.headers as { Authorization: string }).Authorization;
    if (token.includes("first-token")) return ok(["QQQ"]);
    return new Promise<Response>(() => {});
  });
  render(<MemoryRouter><SessionProvider><SwitchUserFixture />
    <WatchlistToggle symbol="QQQ" /><WatchlistPanel />
  </SessionProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "첫 계정" }));
  await screen.findByRole("link", { name: /QQQ ·/ });
  fireEvent.click(screen.getByRole("button", { name: "다른 계정" }));
  expect(screen.queryByRole("link", { name: /QQQ ·/ })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "관심 종목에 추가" })).toBeDisabled();
});
