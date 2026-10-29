# ShockGraph 웹 화면

거시경제 공식 발표 자료를 확인하고 QQQ·SPY의 공개 차트와 종목방으로 이동하는 독립 프론트엔드다. [Figma 초안](https://www.figma.com/design/W5ajg1IFiffFm8OaUIuwob)의 홈·종목 상세·토론방 구조를 반영했다.

## 로컬 실행

Node.js 24 이상이 필요하다. 패키지 버전은 `package-lock.json`으로 고정한다.

```sh
npm ci
npm run check
npm test
npm run build
npm run verify:dist
npm run smoke:routes
npm run dev
```

Vite가 표시하는 로컬 주소에서 확인한다. 종목 상세는 `/assets/QQQ`, 토론방은 `/rooms/SPY`로 접근한다. 알 수 없는 종목은 홈으로 이동한다. `verify:dist`는 빌드된 HTML이 참조하는 JS·CSS 파일이 실제로 존재하며 비어 있지 않은지 확인한다. `smoke:routes`는 빌드 미리보기에서 홈·QQQ/SPY 상세·종목방 주소를 직접 요청하고 JS·CSS 응답을 확인한다. 이 검사는 Vercel 배포의 rewrite 상태를 대신하지 않는다.

## 코드 읽는 순서

1. `src/main.tsx`: React 시작점, Router와 서버 자료 Provider
2. `src/app/router.tsx`: 화면의 주소와 배치
3. `src/pages/HomePage.tsx`: 기능 컴포넌트를 조립하는 화면
4. `src/features/events/SourceList.tsx`와 `sources.ts`: 기관 원문 자료와 재사용 UI
5. `src/features/market/TradingViewChart.tsx`: 외부 위젯을 Effect로 연결·정리하는 경계
6. `src/pages/pages.test.tsx`: 사용자가 보는 결과 중심의 시험

현재는 공식 발표 자동 API와 회원 서버가 연결되지 않았다. TanStack Query Provider는 실제 API 연결을 위한 앱 경계이며 아직 조회 캐시 성능을 주장하지 않는다. [전환 리뷰](docs/reviews/react-typescript-frontend-review.md)에 구현과 남은 범위를 구분했다.

## 서비스 경계

- 홈은 연준·BLS·BEA의 공식 일정 원문으로 연결한다. 자동 발표 날짜나 결과를 생성하지 않는다.
- 종목 상세의 시세 차트는 TradingView가 직접 제공한다. 비공개 Alpaca 원본을 브라우저로 보내거나 이 차트를 연구 입력으로 읽지 않는다.
- 예측 성능은 실제 미래 정답과 시간순 평가가 부족해 `HOLD`다. 미래 방향·위험 수치를 표시하지 않는다.
- 관심 목록은 현재 개인별 저장 기능이 아니다. 종목방은 화면 흐름만 있으며 채팅·회원 인증·게시물 조회는 아직 연결되지 않았다.

## 다음 연결

회원·채팅은 Java 서비스가 신원을 검증한다. 공식 발표 사건과 검증된 연구 상태는 FastAPI의 공개 읽기 API를 통해 받는다. 브라우저에 API 키를 넣거나 가격 원본을 복제하지 않는다. 실제 연결 전에는 출처 시각, 미확인/오류/자료 없음 상태, 접근 제어를 계약 시험으로 확인한다. 상세 조건은 [연구·표시 경계](docs/research-handoff.md)를 따른다.

현재 [공개 홈](https://shockgraph-web.vercel.app/)은 열리지만, 2026-10-29 확인 당시 상세 주소 직접 접근은 404였다. SPA rewrite와 문구 수정은 초안 PR에 있으므로 공개 화면에 반영되기 전이다. 배포 절차와 남은 검증은 [배포 점검표](docs/deployment.md)를 따른다.
