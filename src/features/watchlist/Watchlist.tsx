import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSession } from "../auth/session";
import { assets, type AssetSymbol } from "../market/assets";
import { watchlistApi, watchlistEnabled } from "./api";

export function WatchlistToggle({ symbol }: { symbol: AssetSymbol }) {
  const { session } = useSession();
  const [selected, setSelected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const token = session?.accessToken;

  useEffect(() => {
    if (!watchlistEnabled() || !token) return;
    let current = true;
    void watchlistApi.list(token).then((list) => {
      if (current) { setSelected(list.includes(symbol)); setReady(true); setLoadedToken(token); setError(""); }
    }).catch((reason: unknown) => {
      if (current) { setReady(false); setLoadedToken(token); setError(reason instanceof Error ? reason.message : "목록을 불러오지 못했습니다."); }
    });
    return () => { current = false; };
  }, [token, symbol]);

  if (!watchlistEnabled()) return null;
  if (!session) return <p>관심 종목에 추가하려면 <Link to="/login">로그인</Link>해 주세요.</p>;
  async function toggle() {
    if (!session || busy || !ready || loadedToken !== token) return;
    setBusy(true);
    try {
      const next = selected ? await watchlistApi.remove(symbol, session.accessToken)
        : await watchlistApi.add(symbol, session.accessToken);
      setSelected(next.includes(symbol));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "저장하지 못했습니다.");
    } finally { setBusy(false); }
  }
  return <div>
    <button className="secondary-action" type="button" disabled={!ready || busy || loadedToken !== token} onClick={() => void toggle()}>
      {loadedToken === token && selected ? "관심 종목에서 제거" : "관심 종목에 추가"}
    </button>
    {loadedToken === token && error && <p role="status">{error}</p>}
  </div>;
}

export function WatchlistPanel() {
  const { session } = useSession();
  const [list, setList] = useState<AssetSymbol[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const token = session?.accessToken;
  useEffect(() => {
    if (!token || !watchlistEnabled()) return;
    let current = true;
    void watchlistApi.list(token).then((result) => {
      if (current) { setList(result); setError(""); setLoading(false); setLoadedToken(token); }
    }).catch((reason: unknown) => {
      if (current) { setError(reason instanceof Error ? reason.message : "목록을 불러오지 못했습니다."); setLoading(false); setLoadedToken(token); }
    });
    return () => { current = false; };
  }, [token]);
  if (!watchlistEnabled() || !session) return null;
  const current = loadedToken === token;
  return <section className="section-block" aria-labelledby="watchlist-title">
    <div className="section-head"><div><p className="eyebrow">내 종목</p><h2 id="watchlist-title">관심 종목</h2></div></div>
    {(!current || loading) && <p>목록을 불러오는 중입니다.</p>}
    {current && error && <p role="status">{error}</p>}
    {current && !loading && !error && list.length === 0 && <p>아직 등록된 종목이 없습니다.</p>}
    {current && !error && <div className="watchlist-links">{list.map((symbol) =>
      <Link key={symbol} to={`/assets/${symbol}`}>{symbol} · {assets[symbol].name}</Link>)}</div>}
  </section>;
}
