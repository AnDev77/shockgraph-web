# 최신 제품 범위·기술 스택·금요일 완료 계획

갱신일: **2026-11-12 한국 시간**. 최신 사용자 결정: **11월 11일 EC2 배포를 목표로 하고, 11월 13일 금요일까지 연구 성과를 제외한 핵심 기능 구현·검증**. 어제 서버 상태를 확인할 수 없어 배포 완료로 기록하지 않는다. 이전 10월 31일/11월 3일/주말 일정은 이 계획으로 대체한다. 과거 기록은 Git 이력과 기존 기능 리뷰에 보존한다.

## 제품 범위

관심 종목에서 주가 그래프·근거 자료·대화로 이어지는 금융 페이지다. 주가 그래프는 유지한다. 회원·QQQ/SPY 채팅·관심 목록을 먼저 완성한다. AI는 근거 자료를 읽고 설명하는 보조 기능이며 아직 입증되지 않은 가격 예측이나 자동 매매로 표시하지 않는다. 포트폴리오 위험·리밸런싱 연구는 별도 트랙으로 유지하고 이번 출시 완료 조건에서 제외한다.

### 금요일 필수

- 실제 이메일 인증→가입→로그인·로그아웃, 잘못된/만료된 코드·재사용·재발송 제한.
- QQQ/SPY 글 조회·로그인 작성·중복 방지·다른 회원 글 누락 방지·재접속 복구.
- Java 소유 관심 종목 저장·해제와 React 목록. 우선 지원 종목 QQQ/SPY; 임의 종목 지원은 별도 범위.
- 기존 주가 그래프, 종목 상세, 출처 링크, 모바일·오류·빈 화면.
- 공개 채팅의 전송 제한·신고·관리자 숨김 처리. 준비되지 않으면 제한된 시연으로 공개 범위를 낮추고 공개 베타 완료로 세지 않는다.
- EC2 회원·채팅 API HTTPS 배포, 실제 메일 수신과 두 브라우저 확인, Blue/Green 전환·되돌리기 및 회원/메시지 보존.

### 여유가 있을 때

출처·기준 시각을 포함하는 단일 버튼 AI 브리핑. LLM 키·사용량 한도·자료 이용 경로가 필요하다. 구현 전에는 동작하는 버튼으로 보이지 않게 한다. 월가 목표주가 Top 5/평균은 기관별 최신 값·발표일·목표 기간·이용 가능한 공급원이 확보된 뒤에 추가한다. 자료 부족을 AI 생성값으로 채우지 않는다.

### 이번 주 필수에서 제외

자유 질문 Agent, 벡터 DB, 자동 주문, 연구 성과 주장, 노트·결제·주주 인증, 임의 종목방 개설, Kafka/Jenkins 신규 도입. Kafka/Jenkins는 금지가 아닌 후속 후보다. Redis 금융 메시지 캐시는 동일 조건 전후 성능 측정 후 결정한다.

## 기술 스택과 역할 (실제 코드와 계획 구분)

| 영역 | 스택 | 책임·현재 상태 | 직접 볼 경로 |
|---|---|---|---|
| 웹 | React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5, Zod 4 | 기능별 React 구조, API 응답 검증; 라이브러리 설치가 모든 화면의 사용을 뜻하지 않음 | `package.json`, `src/pages`, `src/features` |
| 회원/API | Java 21, Spring Boot 3.3.5, Spring Security, JPA | 이메일 인증·JWT·회원·채팅. 관심 목록은 신규 구현 대상 | doChallenge `build.gradle`, `src/main/java/com/fitmeet/auth`, `financechat` |
| 채팅 | REST + Spring WebSocket/STOMP | 현재 React는 5초 간격 REST 조회. 서버는 앱 내부 SimpleBroker; 두 앱 간 방송 공유는 아직 없음 | `src/pages/RoomPage.tsx`, Java `common/config/WebSocketConfig.java` |
| 저장 | MySQL 8.4 + Flyway | 회원·메시지 영속 원본. Flyway/BlueGreen은 Java 초안 #12~#14에 있으며 main 미반영 | Java `src/main/resources/db/migration`, `deploy/compose.bluegreen.yaml` |
| 임시 상태 | Redis 7.4 | 이메일 코드·일회용 증표·제한. 금융 채팅 캐시·색상 간 Pub/Sub는 현재 구현과 구분 | Java `auth/infrastructure`, `deploy/compose.bluegreen.yaml` |
| 웹 배포 | Vercel | 공개 웹, 빌드 시 API 주소/기능 플래그 | `vercel.json`, `docs/auth-connection.md` |
| Java 배포 | AWS EC2 + Docker Compose + Nginx | 80/443만 공개, 두 Java 버전이 동일 MySQL/Redis 사용 | Java `deploy/compose.bluegreen.yaml`, `bluegreen.py`, `nginx.bluegreen.conf` |
| CI/CD | GitHub Actions | Java 전체 시험/JAR/이미지/컨테이너 인수, 웹 타입/린트/시험/빌드/브라우저. EC2 자동 배포와는 별개 | 각 저장소 `.github/workflows` |
| AWS 권한/비밀 | IAM 인스턴스 역할, SSM/Parameter Store 경로 확인 필요 | 역할 설정 완료는 사용자 확인. GitHub Secrets 자동 복사 없음; GitHub OIDC 역할과 EC2 역할은 별개 | Java `deploy/ec2_preflight.py` |
| Python 연구 | Python 3.12+, Pydantic, SciPy, HTTPX, R2/boto3 선택 의존성 | 수집·연구·승인된 분석; 현재 wheel은 FastAPI 운영 서버가 아님 | ShockGarph_AI `pyproject.toml`, `apps`, `packages` |
| AI 브리핑 계획 | Python API(FastAPI 후보) + LLM API + 자료 조회 + JSON 검증 | 새 기능. 자체 DB/API 검색부터, 벡터 DB 필수 아님. Java가 인증/호출 제한 담당 | 구현 전; 존재하지 않는 서비스 경로를 만들었다고 보고하지 않음 |

기존 서버/패키지를 일괄 업그레이드하지 않고 잠금 파일과 검증된 이미지 기준을 유지한다. 운영 SMTP/JWT/R2 값, 금융 원본 가격·비공개 MAE/CI는 문서·로그·PR에 넣지 않는다.

## 3일 일정

| 날짜 | 핵심 작업 | 완료 증거 |
|---|---|---|
| 11/11 수, 경과 | 최신 main/PR/CI 확인, EC2 읽기 전용 점검 코드/원격 게이트 준비 | Java #15의 원격 검사 성공. EC2 진단 결과가 아직 없어 운영 배포는 미확인 |
| 11/12 목, 오늘 | EC2 점검 결과 회수, TLS/SMTP/DB 보존과 승인 main 확인 뒤 배포 인수. Java 관심 목록 저장/해제·React 목록, 채팅 누락·신고·전송 제한·관리자 숨김, Blue/Green 연결의 전달 방식 보완 | 사용자 간 관심 목록 격리, 권한/중복/제한 시험, 양 버전 연결에서 메시지 전달·복구. 서버 상태 불명확 시 배포 미실행 |
| 11/13 금 | EC2 대기 검증→전환→사후 검증→되돌리기, DB/회원/메시지 보존, 모바일·실사용 동선, 운영 문서 | TLS/실SMTP/두 브라우저 결과, 재로그인/재조회, 실패 복귀 증거. 핵심 완료 후에만 AI 브리핑 시도 |

배포 목표가 외부 입력이나 승인 main 부재로 막히면 즉시 항목을 명시한다. 작업 시간을 검사 문서만 반복하는 데 쓰지 않고 관심 목록·채팅 오류·운영 보호 등 독립 구현을 계속한다. 일정은 목표이며 완료 보고는 실제 증거로 결정한다.

## 오늘 확인한 상태와 차단 요인

- main: Java `0b9e926`, 웹 `f64feb8`, Python `a993373`. Java 초안 #10→#14, 웹 #3, Python #8~#17 확인.
- Java #14 `b5b5cdd`의 원격 게이트 6개 성공. 웹 #3 및 main CI 성공. 기존 CI 성공을 이번 새 커밋의 성공으로 재사용하지 않는다.
- 사용자는 IAM 역할 설정과 EC2 터미널 접속 가능을 확인했다. 현재 개발 환경에서 AWS/SSH 연결은 확보하지 못했다. 실제 서버 JSON 점검 결과, API 주소·TLS, 서버 SMTP/비밀 설정, 기존 DB 상태가 필요하다. 배포 완료 증거는 아직 없다.
- 초안 자동 병합 금지 유지. PR #10~#14 의존 순서를 검토한 뒤 사용자 병합 결정과 최종 main CI 확인이 필요하다. 배포 허가와 초안 자동 병합 허가는 같은 것으로 가정하지 않는다.
- 현재 Java SimpleBroker는 색상 간 구독을 공유하지 않는다. 기존 소켓이 구버전에 붙어 있으면 신버전 방송이 전달되지 않을 수 있으므로 무중단 채팅을 주장하지 않는다. 공유 이벤트 전달 또는 재접속/DB 복구 전략을 검증한다.

## 매 작업 절차

최신 사용자 결정→이 계획→AGENTS와 해당 기능 리뷰 순으로 확인한다. 세 저장소 원격 상태와 로컬 작업 트리를 확인하고 중복 쓰기를 피한다. 시작·중간·완료 근거와 작업량/오류/한계를 안전한 기능 리뷰에 기록한다. 과거 비공개 성과가 포함된 Python progress/troubleshooting/scorecard 전체 업로드는 하지 않는다. 코드가 바뀐 저장소에서 전체 시험과 빌드 및 최종 원격 게이트를 확인한다. 소프트웨어 통과, 실제 운영, 미래 예측 성능, 제품 수요는 별도 판정한다.

오늘 구현 상세: [채팅 조회 기준 누락 수정](reviews/chat-read-cursor-review.md), [EC2 사전 점검 PR](https://github.com/AnDev77/doChallenge/pull/15).

## 11월 12일 중간 진행

- Java [관심 종목 초안 #16](https://github.com/AnDev77/doChallenge/pull/16)에 회원별 QQQ/SPY 조회·추가·제거와 추가 V2 스키마를 제안했다. 격리 시험은 V1/V2 두 앱의 공유 DB·Redis 및 기존 회원/대화 보존을 확인한다. 운영 DB 결과는 별도다.
- 웹 [채팅 읽기 기준 수정 #4](https://github.com/AnDev77/shockgraph-web/pull/4)와 그 위의 관심 목록 화면 초안을 구분한다. 관심 목록은 Java/HTTPS/실메일 연동 전 기능 플래그를 켜지 않는다.
- 사용자가 확인한 EC2 `~/doChallenge`는 `0b9e926`이고 Docker 컨테이너·볼륨 출력은 비어 있다. Docker/Compose·IAM 역할 연결·SSM 에이전트는 사전 점검에 표시됐으나 서버 `.env`와 API TLS/SMTP, 승인 main이 아직 없다. 첫 설치 전 기존 호스트 DB와 권한은 별도 확인한다.
- 최신 PR들의 CI가 모두 성공하고 안전한 운영 이미지/서버 설정을 확인하기 전에는 공개 회원·채팅 배포 완료로 적지 않는다. 연구 성능과 상품 수요도 HOLD다.
