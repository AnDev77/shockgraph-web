export const assets = {
  QQQ: {
    symbol: "QQQ", name: "나스닥 100 ETF",
    chartSymbol: "NASDAQ:QQQ",
    chartUrl: "https://www.tradingview.com/symbols/NASDAQ-QQQ/",
  },
  SPY: {
    symbol: "SPY", name: "S&P 500 ETF",
    chartSymbol: "AMEX:SPY",
    chartUrl: "https://www.tradingview.com/symbols/AMEX-SPY/",
  },
} as const;

export type AssetSymbol = keyof typeof assets;
export function isAssetSymbol(value: string | undefined): value is AssetSymbol {
  return value === "QQQ" || value === "SPY";
}
