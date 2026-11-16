import { expect, test } from "@playwright/test";
import { serveInstruments } from "./instruments-fixture";

test("홈에서 세 대표 종목의 차트 출처와 공식 IR을 열 수 있다", async ({ page }) => {
  // The browser checks the widget contract without depending on the external price feed.
  await page.route("https://widgets.tradingview-widget.com/**", (route) => route.abort());
  await serveInstruments(page);
  await page.goto("/");
  await page.getByRole("link", { name: /스페이스X/ }).click();
  await expect(page).toHaveURL(/\/assets\/SPCX$/);
  await expect(page.getByRole("link", { name: /공식 IR 열기/ })).toHaveAttribute("href", "https://ir.spacex.com/");
  await expect(page.locator("tv-advanced-chart")).toHaveAttribute("symbol", "NASDAQ:SPCX");
  await page.getByRole("group", { name: "종목 선택" }).getByRole("link", { name: /CAMT/ }).click();
  await expect(page).toHaveURL(/\/assets\/CAMT$/);
  await expect(page.getByRole("link", { name: /공식 IR 열기/ })).toHaveAttribute("href", "https://www.camtek.com/investors/");
  await expect(page.locator("tv-advanced-chart")).toHaveAttribute("symbol", "NASDAQ:CAMT");
  await page.getByRole("link", { name: /AVGO 브로드컴/ }).click();
  await expect(page).toHaveURL(/\/assets\/AVGO$/);
  await expect(page.getByRole("link", { name: /공식 IR 열기/ })).toHaveAttribute("href", "https://investors.broadcom.com/");
  await expect(page.locator("tv-advanced-chart")).toHaveAttribute("symbol", "NASDAQ:AVGO");
  await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "토론" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
