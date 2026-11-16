import { Link } from "react-router";
import { InvestmentLayout } from "../app/layouts/InvestmentLayout";
import styles from "../app/layouts/InvestmentLayout.module.css";
import { BriefingPanel } from "../features/briefing/BriefingPanel";
import { SourceList } from "../features/events/SourceList";

export function HomePage() {
  return <InvestmentLayout context={<SourceList />}>
    <header className={styles.title}><h1>종목 브리핑</h1>
      <p>종목을 선택해 최근 소식과 출처를 확인하세요.</p></header>
    <section aria-label="스페이스X 브리핑">
      <p className="eyebrow">SPCX · 스페이스X</p>
      <BriefingPanel symbol="SPCX" />
    </section>
    <div className={styles.actions}><Link to="/assets/SPCX#chart">SPCX 차트 보기</Link></div>
  </InvestmentLayout>;
}
