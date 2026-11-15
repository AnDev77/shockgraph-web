# 스페이스X·캠텍 종목 목록 확장

기준일: 2026-11-15 한국 시간. 웹 main `f64feb8`에서 독립 브랜치를 만들었다. 열린 관심 목록 #5와 모바일 토론 #6은 유지한다. 이전에 확인한 [EC2 읽기 전용 연결](https://github.com/AnDev77/doChallenge/actions/runs/43344514998/attempts/2)과 [기동용 초안](https://github.com/AnDev77/doChallenge/pull/21)은 운영 배포 완료 근거가 아니다.

## 구현과 경계

- 스페이스X [공식 IR](https://ir.spacex.com/faqs-and-contact/)과 [Nasdaq SPCX](https://www.nasdaq.com/market-activity/stocks/spcx), 캠텍 [공식 IR](https://www.camtek.com/investors/)과 [Nasdaq CAMT](https://www.nasdaq.com/market-activity/stocks/camt)를 대조했다.
- 홈과 상세 화면은 4개 종목으로 확장하고 두 개별 종목에 TradingView와 회사 IR을 연결했다. 토론 허용 목록은 QQQ·SPY로 분리했다. 지원하지 않는 개별 종목방 주소로 접근하면 해당 상세로 이동한다. Java 회원별 저장·Python 연구·운영 설정은 변경하지 않았다.
- 소스·화면·스타일 7개, 시험·빌드 점검 3개, 이 리뷰 1개를 변경했다. 실제 외부 위젯은 제3자 네트워크에 의존한다. 브라우저 시험은 위젯 요청을 중단해 종목 식별자·이동·IR 링크·화면 폭을 확인하며 시세 수신 성공을 주장하지 않는다.

## 검증과 다음 작업

- 로컬 TypeScript·ESLint, 19개 시험, 빌드·자산 2개와 직접 URL 9개 검사 통과. 로컬 Playwright는 Chromium 바이너리 부재로 브라우저 시작 전 실패했다. PR에서 모바일·데스크톱 검증을 별도로 확인한다.
- 운영 선행: 승인된 Java 이미지를 EC2 격리 환경에서 기동해 API부터 확인하고, 이후 실제 이메일 가입과 두 브라우저 채팅을 검증한다.
- 제품 후속: Java와 웹의 관심 목록 허용 범위를 함께 확장해 두 종목을 계정에 저장한다. 그 위에 공식 IR·공시 원문 링크, 발표일과 요약 기준 시각을 붙인 브리핑을 추가한다. 출처가 없으면 요약을 유보한다. 월가 목표가와 예측 성과는 이번 범위에 포함하지 않는다.
