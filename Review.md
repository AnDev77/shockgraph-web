# 대표 종목과 미국 종목 검색 범위 조정

2026-11-16 KST. [제품 방향](docs/current-product-direction.md), [일일 계획](docs/daily-work-plan.md), [검색·기능 구조](docs/rag-briefing-architecture.md), AGENTS.md와 이 리뷰를 갱신했다. 실행 코드는 변경하지 않았다.

- 시작: 원격 웹 main `f64feb8`과 초안 #8 `b5589aa`를 대조했다. 웹 브리핑 초안 #9는 SPCX·CAMT·QQQ·SPY를 정적 목록으로 제공하며 AVGO를 아직 포함하지 않는다. Java 브리핑 허용 목록과 Python의 CAMT 공시 수집 범위도 확인했다.
- 중간: SEC·Nasdaq 공지로 세 회사의 종목을 확인했다. `SPCX`의 과거 티커가 다른 증권에 쓰였고 `CAMT`는 이중 상장이라는 점을 식별 기준에 반영했다. 종목 목록, 시세, AI 자료의 사용 범위와 비용을 분리했다.
- 완료: CAMT·SPCX·AVGO가 홈과 기본 관심 목록의 우선 종목이다. 검색은 미국 주요 거래소 보통주·ETF에서 시작하고 차트·브리핑·예측·채팅 지원 여부를 별도 표시한다. 기존 QQQ/SPY 기능은 유지한다.
- 검증: 상대 링크 6개와 diff 형식을 확인했다. 기존 웹의 타입·린트, 테스트 17건, 제작 빌드와 직접 URL 7개 검사가 통과했다. 새 기능 시험이 아니며 브라우저·원격 CI는 별도 확인한다.
- 한계: 실제 목록 다운로드·권리 확인, 차트의 브라우저 재현, 브리핑 운영, 부하 측정, AVGO 화면과 검색 API 구현은 후속 작업이다. 공급자 목록은 후보이며 지원 종목 수나 배포 성공을 주장하지 않는다.
- 확인할 현행 코드: 웹 #9 `src/features/market/assets.ts`, `src/app/layouts/InvestmentLayout.tsx`; Java #23 `src/main/java/com/fitmeet/briefing/BriefingGateway.java`; Python #18 `packages/briefing/shockgraph_briefing/filings.py`.

## 구조 검토: 유지할 경계와 먼저 해결할 결함

검토일 2026-11-16. 원격 Java #23 `8610cc9`, Python #18 `7cbcbe0`, 웹 #9 `e133f05`, 계획 #8 `b642fd9`를 대조했다. 모두 초안이다. 아래는 코드·문서 검토 결과이며 실제 장애 재현·부하 측정 결과가 아니다.

### P1 — 종목과 기능 지원 계약이 세 앱에서 따로 결정된다

근거: [웹 assets.ts](https://github.com/AnDev77/shockgraph-web/blob/e133f052adfdd2259d6300a1d2e23ccc0116ebea/src/features/market/assets.ts), [Java BriefingGateway](https://github.com/AnDev77/doChallenge/blob/8610cc9cb82eeceb84d5751e25e58bbc94bbe00d/src/main/java/com/fitmeet/briefing/BriefingGateway.java), [Python Symbol](https://github.com/AnDev77/ShockGarph_AI/blob/7cbcbe045894c675e91fa6f75ee79e625a75bb9a/packages/briefing/shockgraph_briefing/pipeline.py)은 각자 4종목을 고정하고 AVGO를 포함하지 않는다. [Python 조회 API](https://github.com/AnDev77/ShockGarph_AI/blob/7cbcbe045894c675e91fa6f75ee79e625a75bb9a/apps/briefing_api/shockgraph_briefing_api/app.py)는 CAMT 이외 지원 타입에 insufficient_sources를 반환한다. 실제 수집기가 없는 경우와 정상 수집 후 새 자료가 없는 경우를 구분하지 못한다.

영향: 화면만 종목을 추가하면 Java 거부 또는 Python 스키마 거부가 발생한다. 전 종목 검색을 열어도 상세·관심·브리핑까지 확장되지 않는다.

수정: Java가 공개 종목 식별·제품 지원 목록을 소유하고 Python의 실제 분석 가능 목록을 반영한다. 최초에는 작은 명시적 카탈로그로 시작해도 된다. 종목 ID와 기능별 지원 상태, 지원하나 미준비/자료 없음/실패 상태를 분리한 버전 계약을 세 앱에 적용한다. 정적 fixture와 스키마를 사용한 교차 앱 계약 시험을 추가한다. 관심·차트 지원만 열린 종목에서는 Python 생성 요청을 보내지 않는 것을 확인한다.

### P1 — 두 Java 프로세스의 실시간 채팅 전달이 연결되지 않는다

근거: [WebSocketConfig](https://github.com/AnDev77/doChallenge/blob/8610cc9cb82eeceb84d5751e25e58bbc94bbe00d/src/main/java/com/fitmeet/common/config/WebSocketConfig.java)는 SimpleBroker, [FinanceChatService](https://github.com/AnDev77/doChallenge/blob/8610cc9cb82eeceb84d5751e25e58bbc94bbe00d/src/main/java/com/fitmeet/financechat/FinanceChatService.java)는 DB 커밋 후 해당 프로세스에서만 방송한다.

영향: 기존 blue 소켓과 신규 green 소켓이 공존하면 양쪽의 실시간 메시지 수신을 보장할 수 없다. DB 공유·Nginx 전환만으로 해결되지 않는다. DB 커밋 뒤 방송 전에 프로세스가 종료되는 구간도 남는다.

수정: 공유 방송 경로 또는 명시적인 소켓 종료·재접속 전략을 선택한다. 전자는 방송 중단 시 DB 복구를 함께 유지하고, 후자는 순간 단절을 무중단으로 표현하지 않는다. 서로 다른 색상의 두 사용자, 전환 중 전송·재접속, 30개 초과 누락 페이지 복구를 실제로 검증한다. 현재 동작을 고가용성·무손실로 설명하지 않는다.

### P1 — 비동기 작업의 완료 상태 동기화와 공유 계산 식별이 미정이다

근거: Java의 [확장 설계](https://github.com/AnDev77/doChallenge/blob/8610cc9cb82eeceb84d5751e25e58bbc94bbe00d/docs/architecture/08-core-api-and-model-extension.md)는 사용자 요청·아웃박스와 Python 접수·lease를 정의한다. 그러나 Java가 Python 완료를 다시 확인하는 경로, 장기 불명 상태, 사용자 요청 ID와 여러 요청이 공유하는 계산 ID의 관계가 명시되지 않았다. 웹 브리핑 설계에는 별도 jobs만 적혀 있다.

영향: 작업은 끝났지만 사용자 화면에 계속 실행 중으로 보이거나 같은 종목 요청이 여러 번 계산될 수 있다. 반대로 요청 ID를 여러 회원이 공유하면 조회 권한을 혼동할 수 있다.

수정 제안: Java request_id는 회원별 요청과 권한을 소유하고 Python execution_id는 실행과 결과의 기준으로 둔다. 동일 모델 버전·전처리 버전·고정 입력 스냅샷·대상/기간·스키마·공개 범위가 같은 경우만 계산을 공유한다. 개인화 입력은 별도 범위다. Java 전달 작업이 Python의 영속 접수를 확인한 후 상태 조회 작업으로 재확인한다. Python 도달 실패는 failed로 덮지 않고 unknown/reconciling 등 상태와 마지막 확인 시각으로 표시한다. 양쪽 저장을 하나의 분산 트랜잭션으로 주장하지 않는다. 재시작·접수 응답 유실·완료 응답 유실·권한 분리를 시험한다. 외부 LLM 호출은 응답 유실 후 재시도 시 과금이 반복될 수 있으므로 정확히 한 번 호출을 보장한다고 하지 않는다.

### P2 — 브리핑 내용의 날짜와 수집 경로의 정상 여부가 분리되지 않는다

근거: Python 조회는 30일 이내 검토 파일을 찾으면 capture 상태를 읽기 전에 반환한다. 공개 freshness는 문서 발표일 기준이다. 웹 계획의 last_source_check_at/published_window/model_version은 현재 [웹 응답 스키마](https://github.com/AnDev77/shockgraph-web/blob/e133f052adfdd2259d6300a1d2e23ccc0116ebea/src/features/briefing/schemas.ts)와 Java 필드 허용 목록에 없다.

영향: 최근 문서가 존재하는 상태에서 수집기가 멈추어도 화면에서 이를 구별할 수 없다. 근거 날짜와 수집 상태가 혼동된다. 현재 반환된 내용이 틀렸다는 주장은 아니다.

수정: 검토된 결과는 유지하면서 결과 기준 기간·생성 시각, 수집 최종 성공 시각·현재 실패 상태를 별도 전달한다. latest 포인터와 내용 버전을 함께 관리하고 세 앱의 호환성을 시험한다. 기존 결과를 재사용해도 수집 장애·기준 시각을 숨기지 않는다.

### P2 — 첫 배포 일정이 미구현 운영 기능을 너무 많이 포함한다

근거: [일일 계획](docs/daily-work-plan.md)은 첫 통합과 같은 주에 영속 작업, 미국 종목 검색, 공급자 연결, 모바일/회원 회귀, Blue/Green을 포함한다. 친구 모델 자원은 미확정이며 임베딩/LangGraph도 구현 완료가 아니다.

수정: 첫 인수는 세 대표 종목 탐색·관심 저장, 지원하는 실제 CAMT 브리핑 연결, 기존 채팅 회귀로 한정한다. 검색 목록 확장, 범용 작업 API, 실제 모델, 의미 검색·LangGraph는 측정 가능한 별도 인수로 진행한다. 구조는 이를 허용하되 초기 배포가 모든 경로를 기동할 필요는 없다. 4GB 호스트에 두 Java·DB·Redis·관측 도구·모델이 함께 들어간다는 보장은 미측정 상태로 둔다.

### 유지할 결정과 다음 구현 순서

- Java 공통 API, Python 분석·추론, React 화면의 경계는 유지한다. Java를 통해 무거운 원문이나 모델 바이너리를 전달하지 않는다.
- 모델 학습과 추론 분리, 검색 목록과 AI 지원 목록 분리, 회원 DB와 분석 데이터 소유 분리는 유지한다.
- 우선 구현: 종목 식별·기능 지원 DTO 및 교차 앱 시험 → 실제 브리핑 조회 연결과 수집 상태 표시 → 채팅 전환 전략·시험 → 비동기 접수/복구 계약 → 모델 연동. 부하 기준선은 실제 조회 연결부터 측정한다.
- 최종 판단: 구조 방향은 채택 가능하지만 현재 구현을 확장성 검증 완료로 승인할 수 없다. 명세의 중복·차이를 먼저 줄이고 한 번에 하나의 사용자 흐름을 실제로 연결한다.
- 검증 한계: 읽기 전용 코드 검토 및 문서 링크 확인만 수행했다. 새 실행 코드·시험·운영 설정을 변경하지 않았고 문서에 기록한 결함을 해결했다고 주장하지 않는다. 리뷰 기록만 기존 계획 초안에 추가하며 병합·배포하지 않는다.
