import { Link, Navigate, useParams } from "react-router";
import { InvestmentLayout } from "../app/layouts/InvestmentLayout";
import styles from "../app/layouts/InvestmentLayout.module.css";
import { BriefingPanel } from "../features/briefing/BriefingPanel";
import { SourceList } from "../features/events/SourceList";
import { assets, isAssetSymbol, isRoomSymbol } from "../features/market/assets";
import { TradingViewChart } from "../features/market/TradingViewChart";

export function AssetPage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  const asset = assets[symbol];
  const context = "investorUrl" in asset ? <section className="pinned-source" aria-label="기업 공식 자료">
    <strong>{asset.name} 투자자 정보</strong>
    <a href={asset.investorUrl} target="_blank" rel="noopener noreferrer">공식 IR 열기 ↗</a>
  </section> : <SourceList />;

  return <InvestmentLayout symbol={symbol} context={context}>
    <header className={styles.title}><h1>{symbol}</h1><p>{asset.name}</p></header>
    <div className={styles.actions}>
      <a href="#briefing">브리핑</a>
      <a href="#chart">차트</a>
      {isRoomSymbol(symbol) && <Link to={`/rooms/${symbol}`}>{symbol} 토론방 미리보기</Link>}
    </div>
    <BriefingPanel symbol={symbol} />
    <section className="panel chart-panel" id="chart" aria-labelledby="chart-title">
      <div className="panel-title"><h2 id="chart-title">주가 차트</h2><span>TradingView 제공</span></div>
      <TradingViewChart symbol={symbol} />
      <p className="chart-caption">차트 데이터와 표시 지연은 TradingView 및 거래소 기준입니다.{" "}
        <a href={asset.chartUrl} target="_blank" rel="noopener noreferrer">차트가 보이지 않으면 TradingView에서 보기 ↗</a></p>
    </section>
  </InvestmentLayout>;
}
