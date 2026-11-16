# 브리핑과 관심 종목 화면 통합 검증

기준일: 2026-11-16 KST.

- 시작: 원격 `main`의 `522e977`에 #7·#8이 반영됐다. #9는 #7 기능 브랜치, #10은 #9 기능 브랜치에 병합됐다. #10 병합 결과 `40e64a6`을 확인했고 변경이 `main`에는 없었다. 별도 작업 트리에서 통합하고 기존 초안 #3~#6에는 쓰지 않았다.
- 중간: `40e64a6`의 변경을 `main`에 적용할 때 `Review.md`의 양쪽 신규 파일이 충돌했다. 최신 제품 방향 문서와 양쪽 리뷰를 보존했다. #5와 최신 관심 목록 코드가 겹치므로 #5 전체는 가져오지 않았다. 채팅 누락 수정 #4와 모바일 가입 #6은 별도 검증이 필요하다.
- 완료 범위: 홈과 상세의 CAMT·SPCX·AVGO, 출처가 있는 브리핑 조회, 회원별 관심 목록 UI와 QQQ·SPY 진입을 한 기준 브랜치에서 검토할 수 있다. React는 API를 조회한다. Java가 회원·관심 저장·채팅을 소유하고 Python이 승인된 분석을 제공한다.
- 로컬: 타입·린트, Vitest 22개, 프로덕션 빌드, HTML 참조 자산 2개 및 직접 경로 10개를 통과했다. 기존 설치 의존성을 재사용했으므로 깨끗한 npm 설치와 Chromium의 모바일·데스크톱 검증은 PR의 원격 Web quality 게이트에서 확인한다.
- 한계: 모의 응답으로 검증한 화면을 실서비스 성공으로 보지 않는다. EC2 쓰기 권한, 운영 TLS·SMTP·비밀 설정, 실제 브라우저 채팅·가격·분석은 확인하지 않았다. Java Blue/Green 코드는 변경하지 않았다. 운영 전환과 자동 병합은 수행하지 않는다. 모델 성능은 HOLD이며 사용자 수요는 미검증이다.

## 주요 코드

- `src/app/layouts/InvestmentLayout.tsx`, `src/pages/HomePage.tsx`, `src/pages/AssetPage.tsx`: 홈과 상세 화면.
- `src/features/market/catalog.ts`, `src/features/watchlist/api.ts`, `src/features/briefing/schemas.ts`: 종목·회원 저장·브리핑 계약.
- `e2e/featured-watchlist.spec.ts`, `e2e/briefing.spec.ts`: 미리보기에서 사용하는 모의 API 검증.
