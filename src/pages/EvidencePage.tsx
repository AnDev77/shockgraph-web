import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Brand } from "../app/AppLayout";
import { evidenceEvents, type EvidenceEventId } from "../features/evidence/events";
import { SourceList } from "../features/events/SourceList";
import { assets, isAssetSymbol, type AssetSymbol } from "../features/market/assets";

export function EvidencePage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  return <ValidEvidencePage key={symbol} symbol={symbol} />;
}

function ValidEvidencePage({ symbol }: { symbol: AssetSymbol }) {
  const [selected, setSelected] = useState<EvidenceEventId>("fomc");
  const event = evidenceEvents.find((item) => item.id === selected) ?? evidenceEvents[0];

  return <main id="main" className="content evidence-view">
    <header className="topbar"><Link className="back-link" to={`/assets/${symbol}`}>← {symbol} 상세</Link><Brand small /></header>
    <div className="detail-head"><p className="eyebrow">발표 자료와 분석 근거</p>
      <h1>{symbol} 근거 보기</h1>
      <p>{assets[symbol].name}에 관한 경제 발표를 원문에서 확인하세요.</p></div>
    <div className="detail-grid"><div className="primary-column">
      <section className="evidence-hero" aria-labelledby="evidence-hero-title">
        <span className="evidence-kicker">SOURCE FIRST</span>
        <h2 id="evidence-hero-title">발표 내용은 공식 자료에서,<br />시장 해석은 검증된 결과에서.</h2>
        <p>발표 전에는 결과를 알 수 없습니다. 과거 가격 반응과 향후 위험 분석은 자료의 시각과 검증을 확인한 뒤 제공하겠습니다.</p>
      </section>
      <section className="panel evidence-panel" aria-labelledby="event-title">
        <div className="panel-title"><h2 id="event-title">발표 자료 선택</h2><span>공식 기관 원문</span></div>
        <div className="evidence-tabs" role="group" aria-label="경제 발표 선택">
          {evidenceEvents.map((item) => <button key={item.id} type="button"
            aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}>{item.label}</button>)}
        </div>
        <div className="evidence-document" aria-live="polite">
          <div><p className="eyebrow">{event.agency}</p><h3>{event.title}</h3>
            <p>먼저 확인할 내용</p></div>
          <ul>{event.checks.map((check) => <li key={check}>{check}</li>)}</ul>
          <a className="secondary-action" href={event.url} target="_blank" rel="noopener noreferrer">
            {event.sourceLabel} 열기 <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section className="panel evidence-panel" aria-labelledby="analysis-title">
        <div className="panel-title"><h2 id="analysis-title">{symbol} 과거 반응과 위험</h2>
          <span className="evidence-badge">검증 대기</span></div>
        <p className="evidence-copy">공통 거래일의 가격, 발표 시각, 데이터 이용권과 독립 시험이 확인되기 전에는 사건별 수익률이나 예측 위험 수치를 표시하지 않습니다.</p>
        <Link className="evidence-inline-link" to={`/assets/${symbol}`}>차트 화면으로 돌아가기 →</Link>
      </section>
    </div><div className="secondary-column">
      <section className="evidence-ai" aria-labelledby="ai-title"><span className="evidence-badge">연결 전</span>
        <h2 id="ai-title">AI 근거 해설</h2>
        <p>공식 원문 검색과 검증된 분석 API를 연결한 뒤 질문 기능을 열겠습니다. 현재 AI가 작성한 요약이나 투자 판단은 제공하지 않습니다.</p>
        <div className="evidence-ai-rule"><strong>예정된 답변 기준</strong><span>원문 링크 · 발표 시각 · 분석 상태 표시</span></div>
      </section>
      <SourceList />
      <Link className="secondary-action" to={`/rooms/${symbol}`}>{symbol} 토론방 보기 →</Link>
    </div></div>
  </main>;
}
