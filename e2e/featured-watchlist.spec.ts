import { expect, test } from "@playwright/test";
import { serveInstruments } from "./instruments-fixture";

test("기존 회원 목록을 건드리지 않고 브로드컴을 저장·삭제한다", async ({ page }) => {
  await serveInstruments(page);
  await page.route("https://widgets.tradingview-widget.com/**", (route) => route.abort());
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ json: {
    success: true, data: { tokenType: "Bearer", accessToken: "synthetic-member", expiresInSeconds: 3600 },
  } }));
  const writes: string[] = [];
  let saved = ["SPY"];
  await page.route(/\/api\/v1\/watchlist(?:\/AVGO)?$/, async (route) => {
    expect(route.request().headers()["authorization"]).toBe("Bearer synthetic-member");
    const method = route.request().method();
    if (method !== "GET") {
      expect(route.request().url()).toMatch(/\/watchlist\/AVGO$/);
      writes.push(method);
      saved = method === "PUT" ? ["AVGO", "SPY"] : ["SPY"];
    }
    await route.fulfill({ json: { success: true, data: saved } });
  });
  await page.goto("/login");
  await page.getByLabel("이메일", { exact: true }).fill("demo@example.invalid");
  await page.getByLabel("비밀번호", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "로그인하기" }).click();
  await expect(page.getByText("로그인했습니다.")).toBeVisible();
  await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "홈" }).click();
  const myList = page.getByRole("region", { name: "내 관심 종목" });
  await expect(myList.getByRole("link")).toHaveCount(1);
  await expect(myList.getByRole("link")).toContainText("SPY");
  expect(writes).toEqual([]);

  await page.getByRole("link", { name: /AVGO 브로드컴/ }).click();
  await page.getByRole("button", { name: "관심 종목에 추가" }).click();
  await expect(page.getByRole("button", { name: "관심 종목에서 제거" })).toBeVisible();
  await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "홈" }).click();
  await expect(myList.getByRole("link", { name: /AVGO/ })).toBeVisible();
  await page.getByRole("link", { name: /AVGO 브로드컴/ }).click();
  await page.getByRole("button", { name: "관심 종목에서 제거" }).click();
  await expect(page.getByRole("button", { name: "관심 종목에 추가" })).toBeVisible();
  expect(writes).toEqual(["PUT", "DELETE"]);
});

test("서버 목록 장애를 정적 미리보기로 숨기지 않는다", async ({ page }) => {
  await page.route("**/api/v1/instruments", (route) => route.fulfill({ status: 503, json: {} }));
  await page.goto("/assets/AVGO");
  await expect(page.getByText("종목 목록을 확인하지 못했어요.")).toBeVisible();
  await expect(page).toHaveURL(/\/assets\/AVGO$/);
  await expect(page.getByRole("link", { name: /공식 IR/ })).toHaveCount(0);
});
