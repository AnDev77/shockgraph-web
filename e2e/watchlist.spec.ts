import { expect, test } from "@playwright/test";

test("로그인 뒤 관심 종목을 저장하면 홈 목록과 상세 버튼에 반영된다", async ({ page }) => {
  let stored: string[] = [];
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({
    json: { success: true, data: { tokenType: "Bearer", accessToken: "synthetic-browser-token",
      expiresInSeconds: 3600 }, error: null },
  }));
  await page.route("**/api/v1/watchlist**", async (route) => {
    expect(route.request().headers().authorization).toBe("Bearer synthetic-browser-token");
    const method = route.request().method();
    if (method === "PUT") stored = ["QQQ"];
    if (method === "DELETE") stored = [];
    await route.fulfill({ json: { success: true, data: stored, error: null } });
  });

  await page.goto("/login");
  await page.getByLabel("이메일", { exact: true }).fill("person@example.invalid");
  await page.getByLabel("비밀번호", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "로그인하기" }).click();
  await expect(page.getByText("로그인했습니다.")).toBeVisible();
  await page.getByRole("link", { name: /시장 자료 보기/ }).click();
  await page.getByRole("link", { name: /나스닥 100 ETF/ }).click();
  await page.getByRole("button", { name: "관심 종목에 추가" }).click();
  await expect(page.getByRole("button", { name: "관심 종목에서 제거" })).toBeVisible();
  await page.getByRole("link", { name: "← 홈" }).click();
  await expect(page.getByRole("link", { name: /QQQ ·/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
