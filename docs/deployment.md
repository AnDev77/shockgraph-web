# 첫 화면 배포 점검표

목표: 2026-10-31까지 홈·종목 상세·토론방 진입 화면의 공개 배포를 검증한다. 실제 채팅과 예측 결과 제공은 별도 인수 조건이다.

1. GitHub의 `AnDev77/shockgraph-web` 저장소에서 `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run verify:dist`, `npm run smoke:routes`의 원격 CI 성공을 확인한다. 초안 PR #1의 이전 `Web quality`는 새 경로 검사 추가 전 단계까지 통과했다. `main`의 첫 실행은 수정 전 파일 검사 때문에 실패했으므로 아직 녹색 상태가 아니다. 로컬 `origin`은 연결했다.
2. Vercel의 https://shockgraph-web.vercel.app/ 홈 배포는 열렸다. 2026-10-29 실제 `/assets/QQQ` 직접 요청은 404였으며, 이 문제를 고치는 `vercel.json`은 초안 PR에 있다. 해당 변경이 배포된 뒤 `/assets/QQQ`, `/rooms/SPY` 직접 요청과 새로고침이 `index.html`을 제공하는지 **배포 주소에서** 확인한다. 루트와 JS·CSS 자산 요청도 정상이어야 한다. 공식 안내: https://vercel.com/docs/frameworks/frontend/vite
3. 실제 모바일·데스크톱 브라우저에서 QQQ/SPY 전환, 공식 기관 링크, TradingView 위젯과 실패 시 대체 링크, 키보드 이동을 확인한다.
4. 외부 위젯의 쿠키·네트워크 요청 및 공개 데이터 표시 조건을 검토해 필요한 개인정보 안내를 게시한다.
5. 회원이나 채팅이 연결되지 않은 상태에서 글쓰기 버튼을 활성화하지 않는다. 예측 수치는 연구 승인 전까지 숨긴다.

Vercel 프로젝트와 공개 홈 주소는 생겼으나 상세 URL 직접 접근 실패와 모바일·데스크톱 검증이 남았다. 초안 PR의 통과나 홈 한 화면이 열린다는 사실만으로 첫 배포 목표가 완료된 것은 아니다.
초안 PR의 Vercel 미리보기는 Ready로 표시되지만 로그인 보호가 있어 공개 브라우저에서 변경된 문구와 rewrite를 아직 확인하지 못했다.
2026-10-29 로컬 빌드 미리보기에서 홈·상세·종목방 5개 직접 URL 및 JS·CSS 응답을 확인했다. 상세 화면에서 하단 `발표`를 누를 때 홈의 공식 자료가 화면에 나타나지 않는 문제도 발견해 초안 PR에 수정했다. 원격 CI와 실제 Vercel 주소의 재검증은 수정 커밋 이후 별도로 확인한다.
