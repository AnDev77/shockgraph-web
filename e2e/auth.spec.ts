import { expect, test } from "@playwright/test";

test("토론방에서 이메일로 가입하고 돌아와 글을 쓴다", async ({ page }) => {
  const calls: Array<{ path: string; request: Record<string, string> }> = [];
  await page.route("**/api/v1/auth/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const request = route.request().postDataJSON() as Record<string, string>;
    calls.push({ path, request });
    let data: unknown = null;
    if (path.endsWith("/confirm")) {
      data = { verificationToken: "a".repeat(43), expiresInSeconds: 600 };
    }
    if (path.endsWith("/signup")) {
      data = { memberId: 1 };
    }
    if (path.endsWith("/login")) data = { tokenType: "Bearer", accessToken: "synthetic-browser-token", expiresInSeconds: 3600 };
    await route.fulfill({ json: { success: true, data, error: null } });
  });
  let saved = false;
  const row = { id: 1, authorId: 3, symbol: "SPY", content: "브라우저에서 보낸 의견", createdAt: "2026-11-13T04:00:00Z" };
  await page.route("**/api/v1/finance/rooms/**", async (route) => {
    expect(new URL(route.request().url()).pathname).toBe("/api/v1/finance/rooms/SPY/messages");
    if (route.request().method() === "POST") {
      expect(route.request().headers().authorization).toBe("Bearer synthetic-browser-token");
      expect(route.request().postDataJSON()).toMatchObject({ content: row.content, requestId: expect.any(String) });
      saved = true;
      return route.fulfill({ json: { success: true, data: row } });
    }
    return route.fulfill({ json: { success: true, data: saved ? [row] : [] } });
  });
  await page.goto("/rooms/SPY");
  await page.getByRole("main").getByRole("link", { name: "로그인", exact: true }).click();
  await page.getByRole("main").getByRole("link", { name: "회원가입", exact: true }).click();
  await expect(page).toHaveURL(/\/signup\?room=SPY$/);
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByRole("button", { name: "인증번호 받기" }).click();
  await expect(page.locator(".auth-message")).toContainText("메일을 확인해 주세요.");
  await page.getByLabel("인증번호 6자리").fill("123456");
  await page.getByRole("button", { name: "인증번호 확인" }).click();
  await page.getByLabel("닉네임").fill("tester");
  await page.getByLabel("비밀번호 (8~64자)", { exact: true }).fill("password123");
  await page.getByLabel("비밀번호 확인", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByText("가입이 완료됐어요")).toBeVisible();
  await page.getByRole("link", { name: "로그인하기" }).click();
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByLabel("비밀번호", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "로그인하기" }).click();
  await expect(page.getByText("로그인했습니다.")).toBeVisible();
  expect(calls).toEqual([
    { path: "/api/v1/auth/email-verifications/send", request: { email: "person@example.invalid" } },
    { path: "/api/v1/auth/email-verifications/confirm", request: { email: "person@example.invalid", code: "123456" } },
    { path: "/api/v1/auth/signup", request: expect.objectContaining({
      email: "person@example.invalid", verificationToken: "a".repeat(43),
    }) },
    { path: "/api/v1/auth/login", request: expect.objectContaining({ email: "person@example.invalid" }) },
  ]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "SPY 토론방으로 돌아가기" }).click();
  await expect(page).toHaveURL(/\/rooms\/SPY$/);
  await page.getByLabel("의견 쓰기").fill(row.content);
  await page.getByRole("button", { name: "게시하기" }).click();
  await expect(page.getByRole("log")).toContainText(row.content);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole("log")).toContainText(row.content);
  await expect(page.getByLabel("의견 쓰기")).toHaveCount(0);
});

test("직접 진입 후 연결 오류가 나면 완료로 표시하지 않는다", async ({ page }) => {
  await page.route("**/api/v1/auth/**", route => route.fulfill({ status: 503, json: { success: false, data: null, error: { code: "AUTH_011" } } }));
  await page.goto("/signup");
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByRole("button", { name: "인증번호 받기" }).click();
  await expect(page.getByRole("status")).toContainText("메일을 보내지 못했습니다");
  await expect(page.getByLabel("인증번호 6자리")).toHaveCount(0);
});
