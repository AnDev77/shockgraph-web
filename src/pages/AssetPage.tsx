import { Link, Navigate, useParams } from "react-router";
import { InvestmentLayout } from "../app/layouts/InvestmentLayout";
import styles from "../app/layouts/InvestmentLayout.module.css";
import { BriefingPanel } from "../features/briefing/BriefingPanel";
import { SourceList } from "../features/events/SourceList";
import { isRoomSymbol } from "../features/market/assets";
import { useCatalog } from "../features/market/catalog";
import { Watchlist } from "../features/watchlist/Watchlist";
import { TradingViewChart } from "../features/market/TradingViewChart";

export function AssetPage() {
  const { symbol } = useParams();
  const catalog = useCatalog();
  if (catalog.loading || (catalog.error && !catalog.instruments.length)) {
    return <InvestmentLayout context={<SourceList />}><h1>종목 상세</h1>
      <p>{catalog.loading ? "종목을 불러오고 있어요." : "종목 정보를 확인하지 못했어요."}</p>
    </InvestmentLayout>;
  }
  const asset = catalog.instruments.find((item) => item.symbol === symbol);
  if (!asset) return <Navigate to="/" replace />;
  const chartUrl = asset.chartSymbol ? `https://www.tradingview.com/symbols/${asset.chartSymbol.replace(":", "-")}/` : null;
  const context = asset.investorUrl ? <section className="pinned-source" aria-label="기업 공식 자료">
    <strong>{asset.name} 투자자 정보</strong>
    <a href={asset.investorUrl} target="_blank" rel="noopener noreferrer">공식 IR 열기 ↗</a>
  </section> : <SourceList />;

  return <InvestmentLayout symbol={asset.symbol} context={context}>
    <header className={styles.title}><h1>{symbol}</h1><p>{asset.name}</p></header>
    <div className={styles.actions}>
      <a href="#briefing">브리핑</a>
      {chartUrl && <a href="#chart">차트</a>}
      {asset.discussion && isRoomSymbol(symbol) && <Link to={`/rooms/${symbol}`}>{symbol} 토론방 미리보기</Link>}
      {isRoomSymbol(symbol) && <Link to={`/assets/${symbol}/evidence`}>{symbol} 발표 근거 보기</Link>}
    </div>
    {catalog.connected && <Watchlist instruments={catalog.instruments} selected={asset} />}
    {asset.briefing ? <BriefingPanel symbol={asset.symbol} /> : <section className="panel" id="briefing">
      <h2>AI 브리핑</h2><p>이 종목의 AI 브리핑은 아직 지원하지 않아요.</p>
    </section>}
    {asset.chartSymbol && chartUrl && <section className="panel chart-panel" id="chart" aria-labelledby="chart-title">
      <div className="panel-title"><h2 id="chart-title">주가 차트</h2><span>TradingView 제공</span></div>
      <TradingViewChart symbol={asset.symbol} chartSymbol={asset.chartSymbol} />
      <p className="chart-caption">차트 데이터와 표시 지연은 TradingView 및 거래소 기준입니다.{" "}
        <a href={chartUrl} target="_blank" rel="noopener noreferrer">차트가 보이지 않으면 TradingView에서 보기 ↗</a></p>
    </section>}
  </InvestmentLayout>;
}
