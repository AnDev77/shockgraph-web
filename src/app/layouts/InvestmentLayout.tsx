import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuthNav } from "../../features/auth/AuthNav";
import { useCatalog, type Instrument } from "../../features/market/catalog";
import { Brand } from "../AppLayout";
import "../../shared/styles/tokens.css";
import styles from "./InvestmentLayout.module.css";

function InstrumentLinks({ items, selected, label }: { items: Instrument[]; selected: string | undefined; label: string }) {
  return <div className={styles.rows} role="group" aria-label={label}>
    {items.map((item) => <Link key={item.symbol} to={`/assets/${item.symbol}`}
      className={styles.row} aria-current={selected === item.symbol ? "page" : undefined}
      aria-label={`${item.symbol} ${item.name}`}>
      <span className={styles.ticker}>{item.symbol}</span>
      <span className={styles.name}>{item.name}</span>
    </Link>)}
  </div>;
}

export function InvestmentLayout({ symbol, children, context }: {
  symbol?: string;
  children: ReactNode;
  context: ReactNode;
}) {
  const catalog = useCatalog();
  return <main id="main" className={`investment-workspace ${styles.workspace}`}>
    <header className={styles.header}><Brand /><AuthNav /></header>
    <div className={styles.grid}>
      <nav className={styles.catalog} aria-label="종목 둘러보기">
        <h2>대표 종목</h2>
        {catalog.loading && <p role="status">종목 목록을 불러오고 있어요.</p>}
        {catalog.error && <><p role="status">종목 목록을 확인하지 못했어요.</p>
          <button type="button" onClick={() => void catalog.retry()}>종목 목록 다시 확인</button></>}
        <InstrumentLinks items={catalog.instruments.filter((item) => item.featured)} selected={symbol} label="종목 선택" />
        <h2>시장 비교</h2>
        <InstrumentLinks items={catalog.instruments.filter((item) => !item.featured)} selected={symbol} label="시장 비교 종목" />
      </nav>
      <div className={styles.main}>{children}</div>
      <aside className={styles.context} aria-label="참고 자료">{context}</aside>
    </div>
  </main>;
}
