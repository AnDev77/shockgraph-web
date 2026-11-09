import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Brand } from "../app/AppLayout";
import { useSession } from "../features/auth/session";
import { chatApi, chatEnabled, type RoomMessage } from "../features/chat/api";
import { sources } from "../features/events/sources";
import { assets, isAssetSymbol, type AssetSymbol } from "../features/market/assets";

export function RoomPage() {
  const { symbol } = useParams();
  if (!isAssetSymbol(symbol)) return <Navigate to="/" replace />;
  return <ValidRoomPage key={symbol} symbol={symbol} />;
}

function ValidRoomPage({ symbol }: { symbol: AssetSymbol }) {
  const { session } = useSession();
  const enabled = chatEnabled();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(enabled);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastId = useRef<number | null>(null);
  const pending = useRef<{ content: string; id: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let busy = false;
    async function refresh() {
      if (busy) return;
      busy = true;
      try {
        const rows = await chatApi.list(symbol, lastId.current ?? undefined);
        if (!active) return;
        if (rows.length) {
          lastId.current = Math.max(lastId.current ?? 0, ...rows.map((row) => row.id));
          setMessages((previous) => {
            const byId = new Map(previous.map((row) => [row.id, row]));
            for (const row of rows) byId.set(row.id, row);
            return [...byId.values()].sort((a, b) => a.id - b.id).slice(-100);
          });
        }
        setError("");
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "토론방 연결에 실패했습니다.");
      } finally {
        busy = false;
        if (active) setLoading(false);
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [enabled, symbol]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!session || !trimmed || trimmed.length > 1000 || sending) return;
    const request = pending.current?.content === trimmed
      ? pending.current : { content: trimmed, id: crypto.randomUUID() };
    pending.current = request;
    setSending(true);
    setError("");
    try {
      const saved = await chatApi.post(symbol, trimmed, request.id, session.accessToken);
      setMessages((previous) => [...previous.filter((row) => row.id !== saved.id), saved]
        .sort((a, b) => a.id - b.id).slice(-100));
      lastId.current = Math.max(lastId.current ?? 0, saved.id);
      setContent("");
      pending.current = null;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "글을 보내지 못했습니다.");
    } finally {
      setSending(false);
    }
  }

  return <main id="main" className="content room-view">
    <header className="topbar"><Link className="back-link" to={`/assets/${symbol}`}>← {symbol}</Link><Brand small /></header>
    <div className="detail-head"><p className="eyebrow">종목별 대화</p>
      <h1>{symbol} 토론방</h1><p>공식 자료를 함께 보며 의견을 나눠요. 글은 투자 조언이 아닙니다.</p></div>
    <div className="room-grid"><div className="primary-column">
      {!enabled ? <section className="room-empty" aria-labelledby="empty-title">
        <div className="empty-icon" aria-hidden="true">↗</div>
        <h2 id="empty-title">아직 대화할 수 없어요</h2>
        <p>회원 기능과 메시지 저장을 연결한 뒤 토론방을 열겠습니다.</p>
        <button type="button" disabled aria-describedby="chat-status">채팅 준비 중</button>
        <small id="chat-status">현재 글을 읽거나 쓸 수 없습니다.</small>
      </section> : <section className="room-chat" aria-label={`${symbol} 메시지`}>
        <div className="room-messages" role="log" aria-live="polite">
          {loading && <p>메시지를 불러오는 중입니다.</p>}
          {!loading && messages.length === 0 && !error && <p>아직 글이 없습니다. 첫 의견을 남겨 주세요.</p>}
          {messages.map((row) => <article className="room-message" key={row.id}>
            <div><strong>회원</strong><time dateTime={row.createdAt}>{new Date(row.createdAt).toLocaleString("ko-KR")}</time></div>
            <p>{row.content}</p>
          </article>)}
        </div>
        {error && <p className="room-error" role="status">{error}</p>}
        {session ? <form className="room-compose" onSubmit={(event) => void submit(event)}>
          <label htmlFor="room-content">의견 쓰기</label>
          <textarea id="room-content" value={content} maxLength={1000}
            onChange={(event) => setContent(event.target.value)} rows={3} />
          <button type="submit" disabled={sending || !content.trim()}>{sending ? "보내는 중" : "게시하기"}</button>
        </form> : <p className="room-login">글을 쓰려면 <Link to="/login">로그인</Link>해 주세요. 읽기는 누구나 가능합니다.</p>}
      </section>}
    </div><div className="secondary-column">
      <aside className="pinned-source"><span>함께 볼 자료</span><strong>FOMC 공식 일정과 성명</strong>
        <a href={sources[0].url} target="_blank" rel="noopener noreferrer">연준 원문 확인 ↗</a></aside>
      <Link className="secondary-action" to={`/assets/${symbol}/evidence`}>{symbol} 발표 근거 보기 →</Link>
      <Link className="secondary-action" to={`/assets/${symbol}`}>{assets[symbol].symbol} 시장 흐름 보기 →</Link>
    </div></div>
  </main>;
}
