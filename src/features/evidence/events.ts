import { sources } from "../events/sources";

export const evidenceEvents = [
  {
    id: "fomc", label: "FOMC", title: "금리 결정 회의", agency: sources[0].agency,
    url: sources[0].url, sourceLabel: "연준 회의 일정·발표문",
    checks: ["회의 날짜와 성명 공개 여부", "정책 성명과 기자회견 자료의 구분"],
  },
  {
    id: "cpi", label: "CPI", title: "소비자물가", agency: sources[1].agency,
    url: sources[1].url, sourceLabel: "노동통계국 발표 일정",
    checks: ["대상 월과 실제 발표 시각", "전체 물가와 근원 물가의 구분"],
  },
  {
    id: "pce", label: "PCE", title: "개인소비지출 물가", agency: sources[2].agency,
    url: sources[2].url, sourceLabel: "경제분석국 발표 일정",
    checks: ["대상 월과 실제 발표 시각", "물가 자료와 GDP 발표의 구분"],
  },
] as const;

export type EvidenceEventId = (typeof evidenceEvents)[number]["id"];
