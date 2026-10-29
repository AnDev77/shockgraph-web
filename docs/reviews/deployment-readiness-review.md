# 첫 화면 배포 준비 리뷰

## 시작 근거

2026-10-29 기준 프론트엔드 커밋 `e608fc7`에는 React·TypeScript 화면과 로컬 빌드가 있었다. 그러나 원격 저장소가 연결되지 않았고 GitHub Actions의 마지막 단계는 이전 JavaScript 빌드의 `dist/styles.css`와 `dist/src/app.mjs`를 요구했다. 현재 Vite의 파일명과 달라 원격으로 올려도 품질 게이트가 실패할 조건이었다. 깊은 주소로 직접 접근할 정적 호스팅 설정도 없었다.

## 작업과 중간 오류

- GitHub Actions의 오래된 파일 검사를 `npm run verify:dist`로 교체하고, 빌드 HTML이 참조하는 해시된 JS·CSS 파일의 존재와 크기를 확인하도록 했다.
- Vercel 공식 Vite 안내에 따른 `vercel.json` SPA rewrite를 추가했다. 호스팅 계정에 실제로 적용한 것은 아니다.
- 첫 검사에서는 새 Node 스크립트의 `console` 전역이 현재 ESLint 규칙에 막혔다. `node:process`의 `stdout`을 명시적으로 import해 수정했다.

## 검증과 완료 상태

`npm ci`의 새 설치가 성공했다. 수정 후 TypeScript와 ESLint 오류 0건, Vitest 화면 시험 4개 통과, Vite 빌드 성공, HTML의 JS·CSS 참조 2개 존재·비어 있지 않음을 확인했다. 로컬 Vite 미리보기에서 `/`, `/assets/QQQ`, `/rooms/SPY`가 HTTP 200 HTML을, 빌드 JS 요청이 HTTP 200 JavaScript를 반환했다. `git diff --check`도 통과했다.

GitHub의 빈 `AnDev77/shockgraph-web`을 확인한 뒤 로컬 `origin`을 연결했다. 로컬 Git에는 GitHub 인증 정보가 없어 일반 `git push`는 실패했다. GitHub 연결 기능으로 React 기반 파일을 `main`에 기록하고 이 수정의 별도 브랜치를 만들었다. GitHub Actions 실행과 Vercel 프로젝트 연결은 아직 확인하지 않았다. 따라서 원격 CI, 실제 배포 주소에서의 새로고침, 외부 TradingView 위젯 로딩, 모바일·데스크톱 시각 검증은 미완료다. 이 변경은 첫 화면을 배포할 준비 작업이며 회원·채팅 서버 연결, 실제 예측 성능, 사용자 수요를 증명하지 않는다. 연구 상태는 `HOLD`다.
