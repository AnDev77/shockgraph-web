# CAMT Java 브리핑 화면 연결

2026-11-20 기준. Java `BRIEFING_PUBLIC_PROVIDER=java`에서 공개 종목 목록은 CAMT만 `briefing=true`로 반환한다. 화면은 이 값을 받은 뒤 `GET /api/v1/briefings/CAMT?window=7d`를 호출한다. 승인 초안이 없으면 `insufficient_sources`를 표시하고, 승인된 요약이 있을 때만 출처 링크가 있는 `ready`를 표시한다.

## 웹 빌드 설정

- `VITE_INSTRUMENTS_API_BASE_URL=https://<실제-Java-HTTPS-호스트>/api/v1/instruments`를 지정한다. 브리핑 API 주소를 따로 지정하지 않으면 같은 호스트의 `/api/v1/briefings`를 사용한다.
- 다른 경로를 쓸 때만 `VITE_BRIEFING_API_BASE_URL=https://<실제-Java-HTTPS-호스트>/api/v1/briefings`를 지정한다. `VITE_BRIEFING_ENABLED=false`는 비상 중단용이다. 브리핑 지원 여부는 종목 목록으로 제한한다.
- Java에는 `APP_AUTH_ALLOWED_ORIGINS=https://shockgraph-web.vercel.app`처럼 정확한 웹 Origin을 설정한다. 프론트에는 Gemini API 키·DB 비밀번호·내부 토큰을 넣지 않는다.

## 한 종목 확인 순서

1. 실제 Java HTTPS URL의 `/api/v1/instruments`가 CAMT `briefing=true`, 다른 종목 `false`를 반환하는지 확인한다. 브라우저 Origin 헤더에 CORS 허용 응답이 있어야 한다.
2. Java 운영자 명령으로 CAMT SEC 수집 → 생성 → 원문 열람 → 사람 검토 → 해시 지정 승인을 수행한다([서버 절차](https://github.com/AnDev77/doChallenge/blob/main/docs/briefing/java-operator-runbook.md)). 승인 전 GET은 `insufficient_sources`; 승인 후 `ready`와 SEC HTTPS 인용을 반환해야 한다.
3. 웹 배포에서 `/assets/CAMT`를 직접 열고 새로고침한다. 네트워크 요청이 Java 호스트로 향하는지, 요약·인용 링크·기준 시각이 표시되는지, 모바일에서도 출처를 열 수 있는지 확인한다. SPCX/AVGO는 계속 미지원으로 보여야 한다.

자동 시험은 합성 승인 응답으로 API 계약과 화면 렌더링을 확인한다. 실자료·실 Gemini 호출·운영 배포 결과를 대신하지 않는다. 현재 실행 환경에는 제공자 키·SEC User-Agent·운영 DB 연결값이 없으므로 실제 원문 브리핑은 별도 운영 입력을 확인한 뒤 실행한다.
