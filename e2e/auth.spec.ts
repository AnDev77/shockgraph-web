import { expect, test } from "@playwright/test";

test("이메일 인증 가입과 로그인은 모바일·데스크톱에서 진행된다", async ({ page }) => {
  const calls: string[] = [];
  await page.route("**/api/v1/auth/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const request = route.request().postDataJSON() as Record<string, string>;
    calls.push(path);
    let data: unknown = null;
    if (path.endsWith("/confirm")) {
      expect(request.code).toBe("123456");
      data = { verificationToken: "a".repeat(43), expiresInSeconds: 600 };
    }
    if (path.endsWith("/signup")) {
      expect(request.verificationToken).toBe("a".repeat(43));
      expect(request.email).toBe("person@example.invalid");
      data = { memberId: 1 };
    }
    if (path.endsWith("/login")) data = { tokenType: "Bearer", accessToken: "synthetic-browser-token", expiresInSeconds: 3600 };
    await route.fulfill({ json: { success: true, data, error: null } });
  });
  await page.goto("/signup");
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByRole("button", { name: "인증번호 받기" }).click();
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
  expect(calls).toHaveLength(4);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByLabel("비밀번호", { exact: true })).toBeVisible();
});

test("직접 진입 후 연결 오류가 나면 완료로 표시하지 않는다", async ({ page }) => {
  await page.route("**/api/v1/auth/**", route => route.fulfill({ status: 503, json: { success: false, data: null, error: { code: "AUTH_011" } } }));
  await page.goto("/signup");
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByRole("button", { name: "인증번호 받기" }).click();
  await expect(page.getByRole("status")).toContainText("메일을 보내지 못했습니다");
  await expect(page.getByLabel("인증번호 6자리")).toHaveCount(0);
});
