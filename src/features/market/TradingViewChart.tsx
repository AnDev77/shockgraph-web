import { useEffect, useRef } from "react";

const widgetUrl = "https://widgets.tradingview-widget.com/w/en/tv-advanced-chart.js";

function ensureWidgetScript() {
  if (document.querySelector('script[data-tradingview-widget="true"]')) return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = widgetUrl;
  script.dataset.tradingviewWidget = "true";
  document.head.appendChild(script);
}

export function TradingViewChart({ symbol, chartSymbol }: { symbol: string; chartSymbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    ensureWidgetScript();
    const chart = document.createElement("tv-advanced-chart");
    chart.setAttribute("symbol", chartSymbol);
    chart.setAttribute("interval", "1D");
    chart.setAttribute("timezone", "America/New_York");
    chart.setAttribute("theme", "light");
    chart.setAttribute("autosize", "");
    host.replaceChildren(chart);
    return () => { chart.remove(); };
  }, [chartSymbol]);

  return <div className="chart-frame" ref={container} role="img"
    aria-label={`${symbol} 외부 제공 차트`} />;
}
