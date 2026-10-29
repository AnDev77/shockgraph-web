import { Link } from "react-router";
import { Brand } from "../app/AppLayout";
import { SourceList } from "../features/events/SourceList";
import { sources } from "../features/events/sources";
import { assets } from "../features/market/assets";
import { ResearchStatusCard } from "../features/research/ResearchStatusCard";

export function HomePage() {
  return <main id="main" className="content home-view">
    <header className="topbar"><Brand /><span className="top-tag">시장 자료 탐색</span></header>
    <section className="intro"><p className="eyebrow">MARKET CONTEXT</p>
      <h1>발표를 이해하고,<br /><em>종목에서 이야기하다.</em></h1>
      <p>공식 거시경제 발표와 관심 종목의 흐름을 한곳에서 살펴보세요.</p></section>
    <div className="home-grid"><div className="primary-column">
      <section className="featured" aria-labelledby="feature-title">
        <span className="feature-kicker">주요 거시 발표</span>
        <h2 id="feature-title">FOMC 발표</h2>
        <p>일정과 성명 원문을 확인하고 QQQ·SPY와 연결된 연구 흐름을 살펴보세요.</p>
        <a href={sources[0].url} target="_blank" rel="noopener noreferrer">연준 공식 일정 확인 ↗</a>
      </section>
      <section className="section-block" aria-labelledby="assets-title">
        <div className="section-head"><div><p className="eyebrow">EXPLORE</p>
          <h2 id="assets-title">먼저 살펴볼 종목</h2></div>
          <span className="section-note">저장 기능은 연결 전</span></div>
        <div className="asset-list">{Object.values(assets).map((asset) =>
          <Link className="asset-card" key={asset.symbol} to={`/assets/${asset.symbol}`}>
            <span className="ticker">{asset.symbol}</span><span><strong>{asset.name}</strong>
              <small>시장 흐름과 관련 자료 보기</small></span><span className="chevron" aria-hidden="true">→</span>
          </Link>)}</div>
      </section>
      <ResearchStatusCard />
    </div><div className="secondary-column"><SourceList /></div></div>
    <p className="footer-note">시세 차트는 외부 제공자가 표시합니다. 연구 중인 예측 수치는 공개하지 않습니다.</p>
  </main>;
}
