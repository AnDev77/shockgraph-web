import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSession } from "../auth/session";
import type { Instrument } from "../market/catalog";
import { watchlistApi, watchlistEnabled } from "./api";

type Props = { instruments: Instrument[]; selected?: Instrument };

export function Watchlist(props: Props) {
  const { session } = useSession();
  if (!watchlistEnabled() || (props.selected && !props.selected.watchlist)) return null;
  if (!session) return <p>내 관심 종목을 저장하려면 <Link to="/login">로그인</Link>해 주세요.</p>;
  return <MemberWatchlist key={session.accessToken} token={session.accessToken} {...props} />;
}

function MemberWatchlist({ token, instruments, selected }: Props & { token: string }) {
  const [items, setItems] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    void watchlistApi.list(token).then((result) => {
      if (current) { setItems(result); setError(""); }
    }).catch((reason: unknown) => {
      if (current) setError(reason instanceof Error ? reason.message : "목록을 불러오지 못했어요.");
    });
    return () => { current = false; };
  }, [attempt, token]);

  async function toggle(symbol: string) {
    if (!items || busy) return;
    setBusy(true);
    setError("");
    try {
      setItems(items.includes(symbol) ? await watchlistApi.remove(symbol, token) : await watchlistApi.add(symbol, token));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "관심 종목을 변경하지 못했어요.");
    } finally { setBusy(false); }
  }

  return <section aria-label="내 관심 종목">
    {!items && !error && <p role="status">관심 종목을 불러오고 있어요.</p>}
    {error && <p role="status">{error}</p>}
    {!items && error && <button type="button" onClick={() => { setError(""); setAttempt(attempt + 1); }}>다시 불러오기</button>}
    {selected && items && <button className="secondary-action" type="button" disabled={busy}
      onClick={() => void toggle(selected.symbol)}>
      {items.includes(selected.symbol) ? "관심 종목에서 제거" : "관심 종목에 추가"}
    </button>}
    {!selected && items && <><h2>내 관심 종목</h2>
      {items.length === 0 ? <p>저장한 종목이 없어요. 종목 상세에서 추가할 수 있어요.</p>
        : <ul>{items.map((symbol) => {
          const asset = instruments.find((item) => item.symbol === symbol);
          return <li key={symbol}>{asset ? <Link to={`/assets/${symbol}`}>{asset.name} · {symbol}</Link> : symbol}</li>;
        })}</ul>}</>}
  </section>;
}
