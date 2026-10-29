import { Link, Navigate, useParams } from "react-router";
import { Brand } from "../app/AppLayout";
import { SourceList } from "../features/events/SourceList";
import { assets, isAssetSymbol } from "../features/market/assets";
import { TradingViewChart } from "../features/market/TradingViewChart";
import { ResearchStatusCard } from "../features/research/ResearchStatusCard";

export function AssetPage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  const asset = assets[symbol];
  return <main id="main" className="content detail-view">
    <header className="topbar"><Link className="back-link" to="/">← 홈</Link><Brand small /></header>
    <div className="detail-head"><p className="eyebrow">ASSET OVERVIEW</p>
      <h1>{symbol}</h1><p>{asset.name} · 발표 자료와 시장 흐름</p></div>
    <div className="detail-grid"><div className="primary-column">
      <section className="panel chart-panel" aria-labelledby="chart-title">
        <div className="panel-title"><h2 id="chart-title">시장 흐름</h2><span>TradingView 제공</span></div>
        <div className="asset-switch" role="group" aria-label="종목 선택">
          {Object.values(assets).map((item) => <Link key={item.symbol}
            className={item.symbol === symbol ? "active" : ""}
            aria-current={item.symbol === symbol ? "page" : undefined}
            to={`/assets/${item.symbol}`}>{item.symbol}</Link>)}
        </div>
        <TradingViewChart symbol={symbol} />
        <p className="chart-caption">차트 시세와 지연 조건은 TradingView 및 거래소 기준입니다.{" "}
          <a href={asset.chartUrl} target="_blank" rel="noopener noreferrer">차트가 보이지 않으면 원문에서 보기 ↗</a></p>
      </section>
      <ResearchStatusCard />
    </div><div className="secondary-column"><SourceList />
      <Link className="primary-action" to={`/rooms/${symbol}`}>{symbol} 토론방 보기 →</Link>
    </div></div>
  </main>;
}
