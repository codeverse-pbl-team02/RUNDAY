# 러닝 경로 조회 서버

Firebase Spark 구성을 유지하면서 카카오 REST API 키를 서버에만 보관하는 별도 Node.js 서버입니다. 기존 `functions/`를 배포하거나 Firebase 요금제를 바꾸지 않습니다.

## 로컬 실행

1. 프로젝트 루트에서 `npm.cmd --prefix server ci`를 실행합니다.
2. `server/.env.example`을 `server/.env`로 복사합니다. 파일이 이미 있으면 덮어쓰지 않습니다.
3. `KAKAO_REST_API_KEY`에 카카오디벨로퍼스의 **REST API 키**를 입력합니다. 기존 `VITE_KAKAO_MAP_APP_KEY`는 지도 표시용 JavaScript 키이므로 복사해 사용하지 않습니다. 해당 앱에서 카카오맵 API를 활성화하고 도보 경로 조회와 좌표→행정구역 변환 API를 이용할 수 있어야 합니다.
4. `FIREBASE_PROJECT_ID`에는 앱이 사용하는 Firebase 프로젝트 ID를 입력합니다. `ALLOWED_ORIGINS`에는 실제 웹 원점과 Android의 `https://localhost`를 지정합니다.
5. 루트에서 `npm.cmd run routing:server`를 실행합니다. Vite 개발 환경의 `/api/walking-route` 요청은 이 서버의 8787 포트로 전달됩니다. 이미 실행 중인 Vite에 프록시가 반영되지 않으면 개발 서버를 재시작합니다.

이 서버는 Firebase Admin SDK로 로그인 ID 토큰을 검증합니다. 프로젝트 ID를 지정한 토큰 검증에는 서비스 계정 키 파일을 따로 복사할 필요가 없습니다. 임의의 UID를 신뢰하거나 인증을 생략하는 개발 모드는 제공하지 않습니다.

## 운영·Android 연결

- 별도 호스팅에 서버를 HTTPS로 배포하고 외부 요청을 받을 `HOST`/`PORT`를 호스팅 환경에 맞게 설정합니다. 로컬 기본값은 `127.0.0.1:8787`입니다.
- 앱의 `.env.local`에 `VITE_ROUTING_API_URL=https://서버주소/api/walking-route`를 지정한 뒤 웹을 다시 빌드합니다. Android는 `https://localhost`가 기기 자신의 주소이므로 로컬 개발 프록시를 사용할 수 없습니다. 서버 연결값을 넣고 Android 앱도 다시 빌드해야 합니다.
- 카카오 REST API 키를 `VITE_*` 변수나 앱 번들에 넣지 않습니다. 서버의 `.env`는 Git에서 제외됩니다. JavaScript 지도 키는 기존 위치에 유지합니다.
- 배포 계정의 카카오맵 사용 설정과 호출 한도를 확인합니다. 기본 요청 제한은 사용자당 분당 10회, 동시 2회, 프로세스 전체 동시 20회입니다. 다중 서버로 확장할 때는 제한 상태를 공유하는 저장소를 붙여야 합니다.

## 처리 범위

`POST /api/walking-route`는 `{ start: { label, latitude, longitude }, end: { label, latitude, longitude } }`를 받습니다. Firebase ID 토큰을 `Authorization: Bearer ...`로 전송해야 합니다.

- 출발·도착 좌표를 카카오 `coord2regioncode.json`으로 각각 확인하고 부산 외이면 거절합니다. 앱이 보낸 지역 이름을 신뢰하지 않습니다.
- 두 지점의 직선거리는 20m 이상, 30km 이하로 제한합니다. 보행 경로 결과는 50km 이하만 수용합니다. 같은 출발·도착 지점의 순환 코스 생성은 이번 범위가 아닙니다.
- 카카오 `GET https://dapi.kakao.com/v2/routing/walk`의 `route.legs[].steps[].path.points`를 순서대로 연결합니다. `status: OK`를 확인하고 `route.properties.totalDistance`를 거리로 사용합니다. 좌표계는 요청·응답 모두 WGS84이며 탐색 옵션은 넓은 길 우선(`BROAD_FIRST`)입니다. 연결이 끊긴 선, 누락된 거리, 잘못된 좌표, 입력 지점에서 크게 벗어난 출발·도착점은 거절합니다. 조회 실패 시 직선 경로로 대체하지 않습니다.
- 페이스는 앱에서 예상 러닝 시간을 계산할 때 사용합니다. API의 보행 예상 시간을 러닝 시간으로 표시하지 않습니다.
- 현재 결과는 실행 중 세션에서 유지합니다. 저장되는 러닝 기록은 기존의 실제 GPS·거리·활동 시간 형식을 유지합니다. 추천 경로의 영구 저장·음성 길안내·자동 재탐색은 포함하지 않습니다.
- API 키·사용자 토큰·출발지·도착지는 서버 로그나 DB에 기록하지 않습니다.

REST API 키가 없거나 인증·권한이 거절되면 `SERVICE_UNAVAILABLE`로 실패하며 실제 결과로 가장한 예시 경로를 반환하지 않습니다. 단위·화면·서버 요청 처리는 모의 응답으로 테스트하며, 실제 카카오 연결은 유효한 REST API 키 설정 후 별도로 검증해야 합니다.

검증: 루트에서 `npm.cmd run test:routing`.

공식 근거: [카카오맵 도보 경로 조회·행정구역 변환 REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api), [Firebase ID 토큰 검증](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
