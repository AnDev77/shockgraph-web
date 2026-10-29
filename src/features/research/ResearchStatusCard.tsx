export function ResearchStatusCard() {
  return <aside className="status-card" aria-label="연구 상태">
    <span className="status-dot" aria-hidden="true" />
    <div><strong>예측 정보는 검증 후 공개</strong>
      <p>실제 결과가 더 쌓이면 정확도를 확인한 뒤 제공하겠습니다.</p></div>
    <span className="status-label">공개 전</span>
  </aside>;
}
