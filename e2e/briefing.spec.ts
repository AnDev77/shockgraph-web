import { expect, test } from "@playwright/test";

test("종목 전환과 다시 확인 후 검증된 출처만 표시한다", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") await page.setViewportSize({ width: 360, height: 800 });
  await page.route("https://widgets.tradingview-widget.com/**", (route) => route.abort());
  let requested = 0;
  await page.route("**/api/v1/briefings/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    expect(search).toBe("?window=7d");
    const symbol = pathname.split("/").at(-1);
    if (symbol !== "CAMT") return route.fulfill({ json: { symbol, status: "insufficient_sources" } });
    requested++;
    if (requested === 1) return route.fulfill({ json: { symbol, status: "pending" } });
    return route.fulfill({ json: {
      symbol, status: "ready", stance: "withheld", freshness: "stale",
      generated_at: "2026-11-15T10:00:00Z",
      summary: [{ text: "합성 시험 문장", citation_ids: ["filing"] }],
      bullish_factors: [], bearish_factors: [], change_conditions: [],
      citations: [{ id: "filing", title: "합성 공시", url: "https://example.invalid/filing", published_at: "2026-11-14T10:00:00Z" }],
    } });
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("확인된 자료가 부족해요");
  await page.getByRole("link", { name: /CAMT 캠텍/ }).click();
  await expect(page.getByRole("status")).toContainText("브리핑을 준비하고 있어요");
  await page.getByRole("button", { name: "다시 확인" }).click();
  await expect(page.getByText("판단 보류", { exact: true })).toBeVisible();
  await expect(page.getByText(/이전 브리핑입니다/)).toBeVisible();
  await expect(page.getByRole("link", { name: "출처 1: 합성 공시" })).toHaveAttribute("href", "https://example.invalid/filing");
  await page.getByText("출처 1개", { exact: true }).click();
  await expect(page.getByRole("link", { name: /합성 공시 ↗/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page.getByRole("link", { name: /SPY S&P 500 ETF/ }).click();
  await expect(page.getByRole("status")).toContainText("확인된 자료가 부족해요");
  await expect(page.getByText("합성 시험 문장")).toHaveCount(0);
});
