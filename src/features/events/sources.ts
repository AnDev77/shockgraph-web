export const sources = [
  {
    label: "FOMC", agency: "미 연방준비제도", description: "회의 일정과 성명 원문",
    url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    label: "CPI · 고용", agency: "미 노동통계국", description: "발표 일정 원문",
    url: "https://www.bls.gov/schedule/news_release/current_year.asp",
  },
  {
    label: "PCE · GDP", agency: "미 경제분석국", description: "발표 일정 원문",
    url: "https://www.bea.gov/news/schedule",
  },
] as const;
