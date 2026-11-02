import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SignupPage } from "../../pages/SignupPage";
import { LoginPage } from "../../pages/LoginPage";
import { SessionProvider } from "./session";
import { authApi } from "./api";

const proof = "a".repeat(43);
const fetchMock = vi.fn<typeof fetch>();
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data, error: null }), { status: 200, headers: { "Content-Type": "application/json" } });
function page(element: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><SessionProvider>{element}</SessionProvider></MemoryRouter></QueryClientProvider>);
}
beforeEach(() => { vi.stubEnv("VITE_AUTH_ENABLED", "true"); vi.stubGlobal("fetch", fetchMock); fetchMock.mockReset(); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

async function verifyEmail() {
  fetchMock.mockResolvedValueOnce(ok(null));
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "person@example.invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "인증번호 받기" }));
  await screen.findByLabelText("인증번호 6자리");
  fetchMock.mockResolvedValueOnce(ok({ verificationToken: proof, expiresInSeconds: 600 }));
  fireEvent.change(screen.getByLabelText("인증번호 6자리"), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "인증번호 확인" }));
  await screen.findByLabelText("닉네임");
}
function fillDetails() {
  fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "tester" } });
  fireEvent.change(screen.getByLabelText("비밀번호 (8~64자)"), { target: { value: "password123" } });
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), { target: { value: "password123" } });
}

test("미연결 배포는 발송이나 가입 성공을 가장하지 않는다", () => {
  vi.stubEnv("VITE_AUTH_ENABLED", "false");
  page(<SignupPage />);
  expect(screen.getByRole("status")).toHaveTextContent("회원 기능을 연결");
  expect(screen.queryByRole("button", { name: "인증번호 받기" })).not.toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
test("발송·확인·가입이 같은 이메일과 일회용 증표로 이어진다", async () => {
  const persist = vi.spyOn(Storage.prototype, "setItem");
  page(<SignupPage />);
  await verifyEmail(); fillDetails();
  fetchMock.mockResolvedValueOnce(ok({ memberId: 1 }));
  fireEvent.click(screen.getByRole("button", { name: "가입하기" }));
  await screen.findByText("가입이 완료됐어요");
  const body = JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body)) as Record<string, string>;
  expect(body).toEqual({ email: "person@example.invalid", nickname: "tester", password: "password123", verificationToken: proof });
  expect(persist).not.toHaveBeenCalled(); persist.mockRestore();
});
test("이메일을 바꾸면 이전 증표와 가입 입력을 폐기한다", async () => {
  page(<SignupPage />); await verifyEmail();
  fireEvent.click(screen.getByRole("button", { name: "다른 이메일로 인증하기" }));
  expect(screen.getByLabelText("이메일")).toHaveValue("");
  expect(screen.queryByRole("button", { name: "가입하기" })).not.toBeInTheDocument();
});
test("가입 저장 실패 후 성공 화면을 보이지 않고 재인증을 안내한다", async () => {
  page(<SignupPage />); await verifyEmail(); fillDetails();
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, data: null, error: { code: "COMMON_002" } }), { status: 503 }));
  fireEvent.click(screen.getByRole("button", { name: "가입하기" }));
  await screen.findByLabelText("이메일");
  expect(screen.getByRole("status")).toHaveTextContent("이메일을 다시 인증");
  expect(screen.queryByText("가입이 완료됐어요")).not.toBeInTheDocument();
});
test("429는 기다릴 시간을 전달하고 새 발송을 막는다", async () => {
  page(<SignupPage />);
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, data: null, error: { code: "AUTH_009" } }), { status: 429, headers: { "Retry-After": "60" } }));
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "person@example.invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "인증번호 받기" }));
  await screen.findByText(/요청이 많습니다/);
  expect(screen.getByRole("button", { name: "인증번호 받기" })).toBeDisabled();
});
test("HTML 200과 잘못된 응답을 로그인 성공으로 해석하지 않는다", async () => {
  fetchMock.mockResolvedValueOnce(new Response("<html>SPA</html>", { status: 200 }));
  await expect(authApi.login("a@example.invalid", "password123")).rejects.toThrow("응답을 확인");
  fetchMock.mockResolvedValueOnce(ok({ accessToken: "token", tokenType: "NotBearer", expiresInSeconds: 1 }));
  await expect(authApi.login("a@example.invalid", "password123")).rejects.toThrow("응답을 확인");
});
test("로그인 성공과 로그아웃은 메모리 세션에 반영된다", async () => {
  page(<LoginPage />);
  fetchMock.mockResolvedValueOnce(ok({ accessToken: "synthetic-token", tokenType: "Bearer", expiresInSeconds: 3600 }));
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "person@example.invalid" } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: "로그인하기" }));
  await screen.findByText("로그인했습니다.");
  fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
  expect(screen.getByLabelText("비밀번호")).toHaveValue("");
});
test("증표 만료 뒤 가입 양식을 사용할 수 없다", async () => {
  page(<SignupPage />); await verifyEmail();
  vi.useFakeTimers();
  // Changing the clock alone must also block submission even before the timer callback.
  vi.setSystemTime(Date.now() + 601_000);
  fillDetails(); fireEvent.click(screen.getByRole("button", { name: "가입하기" }));
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
test("잘못된 로그인은 세션을 만들지 않는다", async () => {
  page(<LoginPage />);
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, data: null, error: { code: "AUTH_005" } }), { status: 401 }));
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "person@example.invalid" } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: "로그인하기" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("맞지 않습니다"));
  expect(screen.queryByText("로그인했습니다.")).not.toBeInTheDocument();
});
