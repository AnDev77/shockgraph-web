import { InvestmentLayout } from "../app/layouts/InvestmentLayout";
import styles from "../app/layouts/InvestmentLayout.module.css";
import { BriefingPanel } from "../features/briefing/BriefingPanel";
import { SourceList } from "../features/events/SourceList";
import { useCatalog } from "../features/market/catalog";
import { Watchlist } from "../features/watchlist/Watchlist";

export function HomePage() {
  const { instruments, connected } = useCatalog();
  const first = instruments.find((item) => item.featured && item.briefing);
  return <InvestmentLayout context={<SourceList />}>
    <header className={styles.title}><h1>종목 브리핑</h1>
      <p>아래 관심 목록에 저장할 종목은 상세 화면에서 선택할 수 있어요.</p></header>
    {connected && <Watchlist instruments={instruments} />}
    {first ? <><p className="eyebrow">{first.symbol} · {first.name}</p><BriefingPanel symbol={first.symbol} /></>
      : <section aria-label="AI 브리핑"><h2>아직 공개된 브리핑이 없어요</h2>
        <p>대표 종목에서 차트와 공식 자료를 확인할 수 있어요.</p></section>}
  </InvestmentLayout>;
}
