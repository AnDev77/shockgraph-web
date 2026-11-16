import { expect, test } from "vitest";
import { parseBriefing } from "./schemas";

const ready = {
  status: "ready", symbol: "CAMT", stance: "mixed", freshness: "current",
  generated_at: "2026-11-15T10:00:00Z",
  summary: [{ text: "합성 시험 문장", citation_ids: ["filing"] }],
  bullish_factors: [], bearish_factors: [],
  change_conditions: [{ text: "합성 시험 조건", citation_ids: ["filing"] }],
  citations: [{ id: "filing", title: "합성 공시", url: "https://example.invalid/filing", published_at: "2026-11-14T10:00:00Z" }],
};

test("다른 종목 응답과 표시할 수 없는 결과를 구분한다", () => {
  expect(parseBriefing(ready, "CAMT")).toMatchObject({ stance: "mixed" });
  expect(() => parseBriefing(ready, "SPCX")).toThrow();
  expect(parseBriefing({ symbol: "CAMT", status: "insufficient_sources" }, "CAMT"))
    .toEqual({ symbol: "CAMT", status: "insufficient_sources" });
});

test("조건의 출처가 누락되거나 외부 링크가 HTTPS가 아니면 브리핑을 거부한다", () => {
  expect(() => parseBriefing({ ...ready, change_conditions: [{ text: "시험", citation_ids: ["missing"] }] }, "CAMT")).toThrow();
  expect(() => parseBriefing({ ...ready, citations: [{ ...ready.citations[0], url: "javascript:alert(1)" }] }, "CAMT")).toThrow();
});
