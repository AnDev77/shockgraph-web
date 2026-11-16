import type { Page } from "@playwright/test";

const entries = [
  ["CAMT", "캠텍 (Camtek)", "NASDAQ:CAMT", "https://www.camtek.com/investors/"],
  ["SPCX", "스페이스X (SpaceX)", "NASDAQ:SPCX", "https://ir.spacex.com/"],
  ["AVGO", "브로드컴 (Broadcom)", "NASDAQ:AVGO", "https://investors.broadcom.com/"],
  ["QQQ", "나스닥 100 ETF", "NASDAQ:QQQ", null],
  ["SPY", "S&P 500 ETF", "AMEX:SPY", null],
] as const;

export async function serveInstruments(page: Page, camtBriefing = false) {
  await page.route("**/api/v1/instruments", (route) => route.fulfill({ json: {
    success: true,
    data: entries.map(([symbol, name, chartSymbol, investorUrl], index) => ({
      symbol, name, chartSymbol, investorUrl, featured: index < 3, watchlist: true,
      briefing: symbol === "CAMT" && camtBriefing, discussion: index >= 3,
    })),
  } }));
}
