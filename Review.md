# Review: 종목 브리핑 화면과 API 조회 경계

기준일: 2026-11-15 KST · 저장소: `AnDev77/shockgraph-web`

## 시작 상태와 범위

[제품 방향·배포 계획 #8](https://github.com/AnDev77/shockgraph-web/pull/8)의 첫 개발 작업이다. 기존 홈에서 FOMC 배너와 연구 상태가 종목 정보보다 먼저 보였다. 홈·상세를 종목 선택, 공개 브리핑, 출처 중심으로 재배치했다. SPCX·CAMT의 차트/IR이 있는 [종목 카탈로그 #7](https://github.com/AnDev77/shockgraph-web/pull/7)의 원격 커밋 `eaebd0b`에서 분리했다. 웹 main `f64feb8`, 회원별 관심 저장 #5, 모바일 가입 #6, Java 배포 #21은 별도 변경으로 확인했다. 이번 PR은 #7 위의 UI 한 단계이며 #5·#6·#8의 문서와 코드를 덮어쓰지 않는다.

## 프로젝트 구조 변경

| 담당 | 직접 확인할 파일 | 바뀐 내용 |
|---|---|---|
| 앱 레이아웃 | [InvestmentLayout.tsx](src/app/layouts/InvestmentLayout.tsx), [InvestmentLayout.module.css](src/app/layouts/InvestmentLayout.module.css) | 홈과 상세가 종목 목록·헤더·본문·자료 영역을 공유. 넓은 화면은 3열, 좁은 화면은 상단 종목 선택과 단일 열 |
| 화면 조합 | [HomePage.tsx](src/pages/HomePage.tsx), [AssetPage.tsx](src/pages/AssetPage.tsx), [AppLayout.tsx](src/app/AppLayout.tsx) | 홈은 SPCX 브리핑과 종목 탐색. 상세는 브리핑→기존 차트→공식 자료를 연결. QQQ/SPY만 기존 토론방 연결. 홈에서 상세 차트로 바로 이동하는 앵커 처리 |
| 브리핑 기능 | [BriefingPanel.tsx](src/features/briefing/BriefingPanel.tsx), [BriefingPanel.module.css](src/features/briefing/BriefingPanel.module.css) | 미공개·로딩·준비 중·자료 부족·조회 실패·이전 결과를 구분. 서버가 준비한 요약마다 출처 링크 연결 |
| API 경계 | [api.ts](src/features/briefing/api.ts), [schemas.ts](src/features/briefing/schemas.ts) | 종목·기간별 요청과 Zod 응답 검증. 회원 토큰 없이 공개 자료만 조회 |
| 공통 스타일 | [tokens.css](src/shared/styles/tokens.css) | 배경·테두리·본문색·강조색 토큰의 적용 범위를 새 작업 화면으로 한정. 가입·로그인·채팅 스타일 영향 최소화 |

## 데이터 흐름과 설정

1. 사용자 화면이 카탈로그나 URL로 종목을 선택한다. 계정별 목록을 저장하는 기능은 아직 없어서 이 목록을 **종목 둘러보기**로 표시한다.
2. 프론트 빌드 변수 `VITE_BRIEFING_ENABLED=true`일 때만 TanStack Query가 `GET /api/v1/briefings/{symbol}?window=7d`를 요청한다. API 경로 기본값은 같은 출처의 `/api/v1/briefings`이며 별도 API 호스트는 `VITE_BRIEFING_API_BASE_URL`로 지정한다. 운영 외부 호스트는 HTTPS를 사용한다. 기능 플래그 기본값은 꺼짐이며, 이 경우 요청 없이 미공개 문구만 렌더링한다.
3. 응답은 최상위 JSON이며 `symbol`, `status`를 포함한다. 상태가 `ready`이면 `stance`, `summary`, `bullish_factors`, `bearish_factors`, `change_conditions`, `citations`, `generated_at`, `freshness`도 필수다. 다른 종목의 응답, 존재하지 않는 인용 ID, 중복 출처 ID, HTTPS가 아닌 출처를 거부한다. 문장과 원문의 의미가 맞는지는 AI 백엔드·평가에서 별도로 확인해야 한다.
4. Query 키는 종목과 7일 범위로 분리된다. 요청 취소와 10초 제한을 적용하고, 준비 중·자료 부족·실패 시 읽기 요청만 다시 할 수 있다. 강세·약세는 서버 응답에 근거하며 프론트에서 판단하지 않는다.

계획상 다음 연결은 React → Java 공개 API → 내부 FastAPI 브리핑 API 및 Python worker다. Java는 회원·관심 저장·채팅, Python은 수집·검색·생성·검증을 담당한다. 이번 변경에는 Java·Python 실행 코드, 생성 요청, 운영 API 연결, 회원 데이터 이관이 없다. 회원별 관심 저장·필터, 실제 브리핑 응답과 공개 배포가 다음 인수 범위다.

## 검증 및 한계

- 중간: 홈·상세의 공통 레이아웃을 먼저 분리한 뒤, 공개 전에는 요청하지 않고 서버 응답이 준비된 경우에만 결과를 그리도록 했다. 기존 공시 링크와 차트 링크가 사라지지 않는지 회귀 시험을 갱신했다.
- 완료: 로컬 타입 검사와 ESLint, Vitest 전체 21건, Vite 프로덕션 빌드, HTML 참조 자산 2개, 직접 URL 9개가 통과했다. 출처가 없는 판단 변경 조건과 잘못된 종목·출처 URL을 거부하는 사례를 [스키마 시험](src/features/briefing/schemas.test.ts)에 포함했다.
- [Playwright](e2e/briefing.spec.ts)는 실제 브라우저에 합성 API 응답을 주고 SPCX → CAMT → SPY를 탐색한다. 대기에서 다시 조회해 출처를 열고, 전환 후 다른 종목의 요약이 남지 않는지 확인한다. 모바일에서는 360px 가로 넘침을 검사한다.
- 로컬 Chromium은 실행 환경의 소켓 권한 제한으로 페이지 열기 전에 종료됐다. 브라우저 결과는 초안 PR의 Web quality 원격 게이트를 기준으로 확인한다. 합성 시험은 운영 AI·시세·메일·채팅 연결을 검증하지 않는다.
- 운영 사용자·모델 성능·제품 수요는 이 작업으로 검증하지 않았다. 자동 병합 및 운영 전환은 수행하지 않는다.
