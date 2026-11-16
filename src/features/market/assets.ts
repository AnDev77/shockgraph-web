export const assets = {
  CAMT: {
    symbol: "CAMT", name: "캠텍 (Camtek)",
    chartSymbol: "NASDAQ:CAMT",
    chartUrl: "https://www.tradingview.com/symbols/NASDAQ-CAMT/",
    investorUrl: "https://www.camtek.com/investors/",
  },
  SPCX: {
    symbol: "SPCX", name: "스페이스X (SpaceX)",
    chartSymbol: "NASDAQ:SPCX",
    chartUrl: "https://www.tradingview.com/symbols/NASDAQ-SPCX/",
    investorUrl: "https://ir.spacex.com/",
  },
  AVGO: {
    symbol: "AVGO", name: "브로드컴 (Broadcom)",
    chartSymbol: "NASDAQ:AVGO",
    chartUrl: "https://www.tradingview.com/symbols/NASDAQ-AVGO/",
    investorUrl: "https://investors.broadcom.com/",
  },
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
  return value !== undefined && Object.hasOwn(assets, value);
}

export const roomSymbols = ["QQQ", "SPY"] as const satisfies readonly AssetSymbol[];
export type RoomSymbol = (typeof roomSymbols)[number];
export function isRoomSymbol(value: string | undefined): value is RoomSymbol {
  return roomSymbols.some((symbol) => symbol === value);
}
