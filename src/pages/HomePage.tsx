import { Link } from "react-router";
import { AuthNav } from "../features/auth/AuthNav";
import { Brand } from "../app/AppLayout";
import { SourceList } from "../features/events/SourceList";
import { sources } from "../features/events/sources";
import { assets } from "../features/market/assets";
import { ResearchStatusCard } from "../features/research/ResearchStatusCard";

export function HomePage() {
  return <main id="main" className="content home-view">
    <header className="topbar"><Brand /><AuthNav /></header>
    <section className="intro"><p className="eyebrow">경제 발표와 시장</p>
      <h1>미국 경제 발표와<br /><em>QQQ·SPY를 함께 살펴보세요.</em></h1>
      <p>공식 발표 일정과 두 종목의 차트를 한곳에서 확인하세요.</p></section>
    <div className="home-grid"><div className="primary-column">
      <section className="featured" aria-labelledby="feature-title">
        <span className="feature-kicker">미국 금리 결정 회의</span>
        <h2 id="feature-title">FOMC 공식 일정</h2>
        <p>미국 연준의 회의 일정과 발표문을 원문에서 확인하세요.</p>
        <a href={sources[0].url} target="_blank" rel="noopener noreferrer">연준에서 일정 보기 ↗</a>
      </section>
      <section className="section-block" aria-labelledby="assets-title">
        <div className="section-head"><div><p className="eyebrow">종목 살펴보기</p>
          <h2 id="assets-title">QQQ·SPY 시장 흐름</h2></div>
          <span className="section-note">현재 제공: QQQ · SPY</span></div>
        <div className="asset-list">{Object.values(assets).map((asset) =>
          <Link className="asset-card" key={asset.symbol} to={`/assets/${asset.symbol}`}>
            <span className="ticker">{asset.symbol}</span><span><strong>{asset.name}</strong>
              <small>차트와 공식 발표 자료 보기</small></span><span className="chevron" aria-hidden="true">→</span>
          </Link>)}</div>
      </section>
      <ResearchStatusCard />
    </div><div className="secondary-column"><SourceList /></div></div>
    <p className="footer-note">차트는 TradingView에서 제공합니다. 자체 분석 결과는 검증을 마친 뒤 공개합니다.</p>
  </main>;
}
