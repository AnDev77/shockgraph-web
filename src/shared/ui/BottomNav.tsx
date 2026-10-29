import { Link, NavLink } from "react-router";
import type { AssetSymbol } from "../../features/market/assets";

export function BottomNav({ symbol }: { symbol: AssetSymbol }) {
  return <nav className="bottom-nav" aria-label="주요 메뉴">
    <NavLink to="/" end>홈</NavLink>
    <Link to="/#sources">발표</Link>
    <NavLink to={`/assets/${symbol}`}>종목</NavLink>
    <NavLink to={`/rooms/${symbol}`}>토론</NavLink>
  </nav>;
}
