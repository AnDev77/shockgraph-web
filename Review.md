# 대표 종목과 미국 종목 검색 범위 조정

2026-11-16 KST. [제품 방향](docs/current-product-direction.md), [일일 계획](docs/daily-work-plan.md), [검색·기능 구조](docs/rag-briefing-architecture.md), AGENTS.md와 이 리뷰를 갱신했다. 실행 코드는 변경하지 않았다.

- 시작: 원격 웹 main `f64feb8`과 초안 #8 `b5589aa`를 대조했다. 웹 브리핑 초안 #9는 SPCX·CAMT·QQQ·SPY를 정적 목록으로 제공하며 AVGO를 아직 포함하지 않는다. Java 브리핑 허용 목록과 Python의 CAMT 공시 수집 범위도 확인했다.
- 중간: SEC·Nasdaq 공지로 세 회사의 종목을 확인했다. `SPCX`의 과거 티커가 다른 증권에 쓰였고 `CAMT`는 이중 상장이라는 점을 식별 기준에 반영했다. 종목 목록, 시세, AI 자료의 사용 범위와 비용을 분리했다.
- 완료: CAMT·SPCX·AVGO가 홈과 기본 관심 목록의 우선 종목이다. 검색은 미국 주요 거래소 보통주·ETF에서 시작하고 차트·브리핑·예측·채팅 지원 여부를 별도 표시한다. 기존 QQQ/SPY 기능은 유지한다.
- 검증: 상대 링크 6개와 diff 형식을 확인했다. 기존 웹의 타입·린트, 테스트 17건, 제작 빌드와 직접 URL 7개 검사가 통과했다. 새 기능 시험이 아니며 브라우저·원격 CI는 별도 확인한다.
- 한계: 실제 목록 다운로드·권리 확인, 차트의 브라우저 재현, 브리핑 운영, 부하 측정, AVGO 화면과 검색 API 구현은 후속 작업이다. 공급자 목록은 후보이며 지원 종목 수나 배포 성공을 주장하지 않는다.
- 확인할 현행 코드: 웹 #9 `src/features/market/assets.ts`, `src/app/layouts/InvestmentLayout.tsx`; Java #23 `src/main/java/com/fitmeet/briefing/BriefingGateway.java`; Python #18 `packages/briefing/shockgraph_briefing/filings.py`.
