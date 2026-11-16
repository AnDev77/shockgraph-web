import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuthNav } from "../../features/auth/AuthNav";
import { assets, type AssetSymbol } from "../../features/market/assets";
import { Brand } from "../AppLayout";
import "../../shared/styles/tokens.css";
import styles from "./InvestmentLayout.module.css";

const catalogOrder = ["SPCX", "CAMT", "QQQ", "SPY"] as const;

export function InvestmentLayout({ symbol, children, context }: {
  symbol?: AssetSymbol;
  children: ReactNode;
  context: ReactNode;
}) {
  return <main id="main" className={`investment-workspace ${styles.workspace}`}>
    <header className={styles.header}><Brand /><AuthNav /></header>
    <div className={styles.grid}>
      <nav className={styles.catalog} aria-label="종목 둘러보기">
        <h2>종목 둘러보기</h2>
        <div className={styles.rows} role="group" aria-label="종목 선택">
          {catalogOrder.map((ticker) => <Link key={ticker} to={`/assets/${ticker}`}
            className={styles.row} aria-current={symbol === ticker ? "page" : undefined}
            aria-label={`${ticker} ${assets[ticker].name}`}>
            <span className={styles.ticker}>{ticker}</span>
            <span className={styles.name}>{assets[ticker].name}</span>
          </Link>)}
        </div>
      </nav>
      <div className={styles.main}>{children}</div>
      <aside className={styles.context} aria-label="참고 자료">{context}</aside>
    </div>
  </main>;
}
