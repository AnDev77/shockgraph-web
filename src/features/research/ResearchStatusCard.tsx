export function ResearchStatusCard() {
  return <aside className="status-card" aria-label="연구 상태">
    <span className="status-dot" aria-hidden="true" />
    <div><strong>예측 연구 진행 중</strong>
      <p>미래 결과가 충분히 쌓인 뒤 시간순으로 성능을 검증합니다.</p></div>
    <span className="status-label">HOLD</span>
  </aside>;
}
