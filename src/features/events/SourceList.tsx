import { sources } from "./sources";

export function SourceList() {
  return <section className="section-block" id="sources" aria-labelledby="sources-title">
    <div className="section-head"><div><p className="eyebrow">OFFICIAL SOURCES</p>
      <h2 id="sources-title">공식 발표 자료</h2></div><span className="section-note">일정은 원문에서 확인</span></div>
    <div className="source-list">{sources.map((source) =>
      <a className="source-row" href={source.url} key={source.url} target="_blank" rel="noopener noreferrer">
        <span className="source-icon" aria-hidden="true">{source.label === "FOMC" ? "F" : source.label.startsWith("CPI") ? "B" : "E"}</span>
        <span className="source-text"><strong>{source.label}</strong>
          <small>{source.agency} · {source.description}</small></span>
        <span className="arrow" aria-hidden="true">↗</span>
      </a>)}</div>
    <p className="source-caveat">발표 날짜와 결과는 이 화면에서 자동 갱신하지 않습니다. 각 기관의 원문을 기준으로 확인하세요.</p>
  </section>;
}
