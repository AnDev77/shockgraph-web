import { useEffect } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router";
import { BottomNav } from "../shared/ui/BottomNav";
import { isAssetSymbol } from "../features/market/assets";

export function AppLayout() {
  const { symbol } = useParams();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#sources") document.getElementById("sources")?.scrollIntoView();
  }, [hash]);
  return <div className="app-shell">
    <a className="skip-link" href="#main">본문으로 이동</a>
    <Outlet />
    <BottomNav symbol={isAssetSymbol(symbol) ? symbol : "QQQ"} />
  </div>;
}

export function Brand({ small = false }: { small?: boolean }) {
  return <Link className={small ? "wordmark small" : "wordmark"} to="/" aria-label="ShockGraph 홈">
    {!small && <span className="brand-mark">S<span>G</span></span>}ShockGraph
  </Link>;
}
