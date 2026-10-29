import { sources } from "./sources";

export function SourceList() {
  return <section className="section-block" id="sources" aria-labelledby="sources-title">
    <div className="section-head"><div><p className="eyebrow">공식 기관 자료</p>
      <h2 id="sources-title">공식 발표 일정</h2></div><span className="section-note">기관 사이트로 이동</span></div>
    <div className="source-list">{sources.map((source) =>
      <a className="source-row" href={source.url} key={source.url} target="_blank" rel="noopener noreferrer">
        <span className="source-icon" aria-hidden="true">{source.label === "FOMC" ? "F" : source.label.startsWith("CPI") ? "B" : "E"}</span>
        <span className="source-text"><strong>{source.label}</strong>
          <small>{source.agency} · {source.description}</small></span>
        <span className="arrow" aria-hidden="true">↗</span>
      </a>)}</div>
    <p className="source-caveat">현재 발표 날짜와 결과는 각 기관의 공식 페이지에서 확인할 수 있습니다.</p>
  </section>;
}
