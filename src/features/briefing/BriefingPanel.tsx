import { useQuery } from "@tanstack/react-query";
import type { AssetSymbol } from "../market/assets";
import { briefingEnabled, getBriefing } from "./api";
import type { Briefing } from "./schemas";
import styles from "./BriefingPanel.module.css";

type ReadyBriefing = Extract<Briefing, { status: "ready" }>;
const labels = { bullish: "강세 우세", bearish: "약세 우세", mixed: "혼재", withheld: "판단 보류" };
const dateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short",
});
const date = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium" });

function Claims({ items, citations }: { items: ReadyBriefing["summary"]; citations: ReadyBriefing["citations"] }) {
  return <ul className={styles.claims}>{items.map((item, index) =>
    <li key={index}>{item.text}
      <span className={styles.references}>{citations.map((source, position) =>
        item.citation_ids.includes(source.id) && <a key={source.id} href={source.url} target="_blank"
          rel="noopener noreferrer" aria-label={`출처 ${position + 1}: ${source.title}`}>[{position + 1}]</a>)}</span>
    </li>)}</ul>;
}

function BriefingResult({ data }: { data: ReadyBriefing }) {
  const groups = [
    ["강세 근거", data.bullish_factors],
    ["약세 근거", data.bearish_factors],
    ["판단이 바뀔 조건", data.change_conditions],
  ] as const;
  return <>
    <div className={styles.meta}>
      <strong className={styles.stance} data-stance={data.stance}>{labels[data.stance]}</strong>
      <span>기준 시각 <time dateTime={data.generated_at}>{dateTime.format(new Date(data.generated_at))} KST</time></span>
    </div>
    {data.freshness === "stale" && <p className={styles.notice}>이전 브리핑입니다. 최신 자료가 반영되지 않았을 수 있어요.</p>}
    <h3>핵심 요약</h3>
    <Claims items={data.summary} citations={data.citations} />
    <div className={styles.factors}>{groups.map(([title, items]) => <div key={title}>
      <h3>{title}</h3>
      {items.length ? <Claims items={items} citations={data.citations} /> : <p className={styles.muted}>표시할 근거가 없어요.</p>}
    </div>)}</div>
    <details className={styles.sources}><summary>출처 {data.citations.length}개</summary>
      <ol>{data.citations.map((source) => <li key={source.id}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>
        <time dateTime={source.published_at}>{date.format(new Date(source.published_at))}</time>
      </li>)}</ol>
    </details>
    <p className={styles.muted}>최근 7일 자료에 대한 AI 해석입니다. 미래 주가를 예측한 결과가 아닙니다.</p>
  </>;
}

function ConnectedBriefing({ symbol }: { symbol: AssetSymbol }) {
  const query = useQuery({
    queryKey: ["briefing", symbol, "7d"],
    queryFn: ({ signal }) => getBriefing(symbol, signal),
    staleTime: 60_000,
    retry: false,
  });
  if (query.isPending) return <p className={styles.notice} role="status">브리핑을 불러오는 중이에요.</p>;
  if (!query.isError && query.data.status === "ready") return <BriefingResult data={query.data} />;
  const message = query.isError || query.data.status === "failed"
    ? "브리핑을 불러오지 못했어요."
    : query.data.status === "pending" ? "브리핑을 준비하고 있어요."
      : "최근 7일 소식을 판단하기에 확인된 자료가 부족해요.";
  return <div className={styles.state}>
    <p role="status">{message}</p>
    <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>
      {query.isFetching ? "확인 중" : "다시 확인"}
    </button>
  </div>;
}

export function BriefingPanel({ symbol }: { symbol: AssetSymbol }) {
  return <section className={styles.panel} aria-labelledby="briefing-title" id="briefing">
    <div className={styles.heading}><h2 id="briefing-title">AI 브리핑</h2><span>최근 7일</span></div>
    {briefingEnabled()
      ? <ConnectedBriefing symbol={symbol} />
      : <div className={styles.state}><strong>아직 공개된 브리핑이 없어요</strong>
        <p>공시와 회사 발표를 확인한 뒤 요약과 출처를 이곳에 표시할 예정이에요.</p></div>}
  </section>;
}
