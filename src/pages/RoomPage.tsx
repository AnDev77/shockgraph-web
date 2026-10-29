import { Link, Navigate, useParams } from "react-router";
import { Brand } from "../app/AppLayout";
import { sources } from "../features/events/sources";
import { assets, isAssetSymbol } from "../features/market/assets";

export function RoomPage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  return <main id="main" className="content room-view">
    <header className="topbar"><Link className="back-link" to={`/assets/${symbol}`}>← {symbol}</Link><Brand small /></header>
    <div className="detail-head"><p className="eyebrow">DISCUSSION</p>
      <h1>{symbol} 토론방</h1><p>공식 발표 자료를 함께 보고 의견을 나누는 공간</p></div>
    <div className="room-grid"><div className="primary-column">
      <section className="room-empty" aria-labelledby="empty-title">
        <div className="empty-icon" aria-hidden="true">↗</div>
        <h2 id="empty-title">토론방 연결을 준비하고 있습니다</h2>
        <p>현재는 실제 게시물이나 회원 정보를 가져오지 않습니다. 인증과 채팅 서버를 연결한 뒤 대화에 참여할 수 있습니다.</p>
        <button type="button" disabled aria-describedby="chat-status">로그인 후 대화 참여</button>
        <small id="chat-status">채팅 기능은 아직 사용할 수 없습니다.</small>
      </section>
    </div><div className="secondary-column">
      <aside className="pinned-source"><span>함께 볼 자료</span><strong>FOMC 공식 일정과 성명</strong>
        <a href={sources[0].url} target="_blank" rel="noopener noreferrer">연준 원문 확인 ↗</a></aside>
      <Link className="secondary-action" to={`/assets/${symbol}`}>{assets[symbol].symbol} 시장 흐름 보기 →</Link>
    </div></div>
  </main>;
}
