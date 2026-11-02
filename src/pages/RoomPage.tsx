import { Link, Navigate, useParams } from "react-router";
import { Brand } from "../app/AppLayout";
import { sources } from "../features/events/sources";
import { assets, isAssetSymbol } from "../features/market/assets";

export function RoomPage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  return <main id="main" className="content room-view">
    <header className="topbar"><Link className="back-link" to={`/assets/${symbol}`}>← {symbol}</Link><Brand small /></header>
    <div className="detail-head"><p className="eyebrow">종목별 대화</p>
      <h1>{symbol} 토론방</h1><p>공식 자료를 바탕으로 의견을 나눌 공간을 준비 중입니다.</p></div>
    <div className="room-grid"><div className="primary-column">
      <section className="room-empty" aria-labelledby="empty-title">
        <div className="empty-icon" aria-hidden="true">↗</div>
        <h2 id="empty-title">아직 대화할 수 없어요</h2>
        <p>회원 기능과 메시지 저장을 연결한 뒤 토론방을 열겠습니다.</p>
        <button type="button" disabled aria-describedby="chat-status">채팅 준비 중</button>
        <small id="chat-status">현재 글을 읽거나 쓸 수 없습니다.</small>
      </section>
    </div><div className="secondary-column">
      <aside className="pinned-source"><span>함께 볼 자료</span><strong>FOMC 공식 일정과 성명</strong>
        <a href={sources[0].url} target="_blank" rel="noopener noreferrer">연준 원문 확인 ↗</a></aside>
      <Link className="secondary-action" to={`/assets/${symbol}`}>{assets[symbol].symbol} 시장 흐름 보기 →</Link>
    </div></div>
  </main>;
}
