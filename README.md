# Runday 로컬 개발

Figma Make에서 내보낸 React 19 + TypeScript + Vite 8 + Tailwind CSS 4 프로젝트입니다.

## VS Code에서 시작하기

1. VS Code의 **파일 → 폴더 열기**에서 `C:\Project\Runday`를 선택합니다.
2. **터미널 → 새 터미널**을 엽니다.
3. 아래 명령으로 개발 서버를 시작합니다.

```powershell
npm.cmd run dev:local
```

브라우저에서 **http://localhost:5174/** 을 엽니다. 시작 화면은 로그인 화면입니다. `login.html`을 직접 열거나 Live Server 확장으로 실행하는 프로젝트가 아닙니다.

소스를 수정하고 저장하면 브라우저 화면에 자동 반영됩니다. 서버를 종료하려면 터미널에서 `Ctrl+C`를 누릅니다. 5174 포트가 사용 중이면 해당 서버를 확인한 뒤 종료하거나 `npm.cmd run dev:local -- --port 5175`로 실행하세요.

VS Code의 **실행 및 디버그**에서 `Runday: Edge에서 실행`을 선택하고 **F5**로 시작할 수도 있습니다. 수동으로 시작한 개발 서버는 먼저 종료하세요. 디버깅 종료 후 개발 서버는 **터미널 → 작업 종료**에서 종료할 수 있습니다.

## 다른 PC 또는 의존성을 다시 설치할 때

이 프로젝트의 도구 설정은 Node.js 22 계열 및 pnpm 10.34.3을 사용합니다. Vite 8을 실행하려면 Node.js 22.12 이상(또는 호환되는 최신 버전)이 필요합니다.

원본 `pnpm-lock.yaml`의 버전으로 설치합니다.

```powershell
npm.cmd exec --yes --package=pnpm@10.34.3 -- pnpm install --frozen-lockfile
npm.cmd run dev:local
```

Windows PowerShell 실행 정책 문제를 피하도록 `npm.cmd` 명령을 사용합니다.

## 수정할 파일

| 위치 | 역할 |
| --- | --- |
| `src/App.tsx` | 화면 전환과 앱 컨테이너 |
| `src/screens/LoginScreen.tsx` | 로그인 화면 |
| `src/screens/HomeScreen.tsx` | 홈 화면 |
| `src/screens/` | 코스, 기록, 혜택 등 14개 화면 |
| `src/components/BottomNav.tsx` | 공통 하단 메뉴 |
| `src/index.css` | 전역 스타일과 폰트 |
| `public/assets/` | 원본 이미지와 SVG |

원본 디자인은 360×800 기준입니다. 현재 CSS, 컴포넌트와 에셋을 기준으로 개발하세요. 화면 폭을 바꾸는 반응형 작업은 각 화면의 배치를 함께 검토해야 합니다.

폰트는 `src/index.css`에서 Figma의 외부 폰트 URL을 불러오므로 인터넷 연결이 필요합니다. 이메일·Google 로그인과 회원 프로필·러닝 기록은 실제 Firebase Authentication 및 Firestore에 연결됩니다. 테스트에 사용할 계정은 앱에서 가입해야 합니다.

## 확인 명령

```powershell
npm.cmd run typecheck
npm.cmd run build
```

빌드 결과는 `dist/`에 생성됩니다.

`AGENTS.md`의 “서버가 이미 실행 중”이라는 설명은 Figma Make 내부 환경 기준입니다. 로컬에서는 위 개발 서버 명령을 직접 실행합니다. `dev:local`은 로컬 주소와 포트를 명시하고 기존 Figma 설정은 계속 사용할 수 있게 합니다.

## Firebase 연결
인증·회원 관리·배포 설정은 FIREBASE_SETUP.md를 확인하세요. 실제 Firebase 설정 전에는 로그인 버튼이 비활성화됩니다.

## Google Play용 Android App Bundle

Capacitor 8을 통해 같은 React 화면과 Firebase 데이터를 Android 앱으로 패키징합니다. 패키지명은 `com.rundy.app`, 최초 버전은 `1.0.0` / 버전 코드 `1`이며 Android 7.0(API 24) 이상을 지원하고 API 36을 타겟으로 합니다.

```powershell
# 이 PC의 최초 빌드 도구 준비. JDK·SDK는 시스템 설정 대신 프로젝트 node_modules/.cache 아래에 설치합니다.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/setup-android-tools.ps1

# 최초 1회만 실행. 기존 업로드 키가 있으면 교체하지 않습니다.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/create-android-upload-key.ps1

# 출시용 AAB·설치 확인용 APK 생성, Android lint 및 서명 검사
npm.cmd run android:bundle

# 다음 업데이트부터는 버전 코드를 반드시 올립니다.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-android.ps1 -VersionCode 2 -VersionName 1.0.1
```

최초 빌드 산출물은 `output/android/com.rundy.app-1.0.0-1.aab`와 `output/android/com.rundy.app-1.0.0-1.apk`입니다. Google Play에는 `.aab`를 올립니다. `.apk`는 Android 기기에서 직접 설치해 기능을 확인할 때 사용합니다.

`credentials/android/`의 업로드 키와 비밀번호 백업, `android/key.properties`, `android/app/google-services.json`은 Git에서 제외합니다. 업로드 키는 다음 업데이트에도 필요하므로 안전한 위치에 별도 백업하세요. Git에 있는 Android 소스만 새 PC로 옮겼다면 이 파일들과 기존 `.env.local`을 복원해야 합니다.

Android에서는 Google 로그인·재인증, GPS 및 사진 촬영·선택에 네이티브 플러그인을 사용합니다. 이메일 로그인·회원 관리·기록 저장 로직은 웹과 공유합니다. 화면이 백그라운드로 가면 러닝을 일시정지하는 기존 동작을 유지하며 백그라운드 위치 권한은 요청하지 않습니다. 촬영·선택한 사진은 기기 내부와 카메라 플러그인의 임시 캐시에서만 처리하며 서버에 업로드하지 않습니다. 화면 크기는 Android WebView에 맞추고 뒤로 가기와 개인정보처리방침 링크를 연결했습니다.

외부 서비스 설정:

- Firebase Android 앱: `com.rundy.app`, 앱 ID `1:519147352407:android:f7af27b62e159932dd8e12`.
- 로컬 출시 APK용 업로드 서명 SHA-1·SHA-256은 Firebase에 등록했습니다.
- 2026-10-19에 제공받은 Google Play **앱 서명 키**의 SHA-1·SHA-256도 같은 Firebase Android 앱에 등록하고 최신 `google-services.json`을 저장했습니다. 기존 배포본에서 사용하는 웹 OAuth 클라이언트 ID가 동일하므로 이번 인증서 등록만을 위해 AAB를 다시 업로드할 필요는 없습니다. Play 설치본의 Google 로그인은 실제 기기에서 확인해야 합니다. 향후 앱 서명 키를 변경하거나 추가하면 해당 키 지문도 Firebase에 등록하세요.
- Kakao 지도 JavaScript 키의 허용 웹 도메인에 `https://localhost`를 저장해야 합니다. Android 앱은 이 주소에서 번들에 포함된 웹 파일을 실행합니다. 실제 서버를 띄우거나 원격 개발 서버를 앱에 연결하지 않습니다.
- 개인정보처리방침: https://dramatic-bait-2f3.notion.site/Rundy_-17a220ff753d80a0b757de50c6c034f3

검증: `npm.cmd run typecheck`, `npm.cmd run test:native`, `npm.cmd run test:maps`, `npm.cmd run test:routes`, Android `lintRelease`. 연결된 Android 기기가 없다면 실제 GPS, 카메라, Google 계정 선택 및 Play 배포 서명으로 로그인하는 과정은 기기에서 별도로 확인해야 합니다. 웹 화면에서 준비 중인 기능은 Android에서도 동일한 상태로 유지됩니다.

## 공통 코스 데이터

홈·코스 목록·상세·GPS 러닝 안내는 `src/data/courses.ts`를 공유합니다. 코스 이름, 지역, 태그, 이미지, 상세 설명을 바꿀 때 각 화면이 아닌 이 파일을 수정합니다. 기존 코스 ID는 유지합니다.

- 거리의 계산 단위는 m입니다. GPX가 있는 4개 코스는 기존 경로 JSON의 `reportedDistanceMeters`를 직접 참조합니다. 좌표 순서와 원본 JSON은 유지합니다.
- `startPoint`는 유효한 GPX의 첫 좌표에서 계산합니다. `route.shape`은 순환형과 편도형을 구분합니다. GPX를 가져왔다는 사실은 현장의 통행 안전성을 검증했다는 뜻이 아닙니다.
- 시간·칼로리는 기존 화면의 추정값을 숫자로 옮겼습니다. 개인 페이스로 계산할 때는 별도의 `estimateRunningMinutes`를 사용합니다. 표시 형식은 공통 함수에서 관리합니다.
- `getRecommendableCourses()`는 유효한 경로와 출발점이 있는 코스를 반환합니다. 을숙도 코스는 목록·상세에서 열람할 수 있지만 GPS 경로가 없어 추천 및 코스 러닝 시작에서 제외합니다.
- 홈의 `featuredCourse`는 공통 자료에서 정한 대표 코스입니다. 현위치 기반 순위 계산은 아직 연결하지 않았습니다.
- 알 수 없는 ID는 다른 코스로 대체하지 않습니다. 상세 화면은 안내를 표시하고, GPS 안내 조회는 `null`을 반환합니다.

DB나 저장된 개인 러닝 기록의 형식은 변경하지 않습니다. `npm.cmd run test:courses`로 코스 ID·좌표·에셋, GPX 일치 여부, 추천 제외, 화면별 표시 일관성을 검사합니다.

## 부산 외 지역 안내

홈과 코스 목록의 현재 위치 지도는 `ServiceAreaProvider`의 공통 지역 판정을 사용합니다. 카카오 지도 SDK의 `coord2RegionCode`로 실제 GPS 좌표의 행정구역을 조회하며, 시·도 필드가 `부산광역시`인지 비교합니다. 지도 이동·확대와 코스 미리보기 좌표는 판정에 사용하지 않습니다.

- 부산 외 지역이 확인되면 지도 하단에 현위치 추천 제한 안내와 **부산 코스 둘러보기** 버튼을 표시합니다. 현재 위치와 지도 조작은 유지합니다. 홈의 버튼은 코스 목록으로 이동하고, 목록의 버튼은 전체 필터로 전환해 코스 카드로 스크롤합니다.
- 코스 열람과 자유 러닝은 지역과 관계없이 이용할 수 있습니다. 홈의 대표 코스는 현위치 추천이 아닌 기존 편집 선정 코스입니다.
- 위치 확인 전·확인 중·지역 조회 중·부산·부산 외·확인 실패를 구분합니다. 권한 거절, 위치 오차 100m 초과, 5분 이상 지난 GPS, 지역 조회 오류·빈 응답은 부산 외로 단정하지 않습니다. 화면의 위치 확인 버튼으로 재시도합니다.
- 최신 GPS로 바뀌면 이전 지역 안내를 숨기고 재판정합니다. 이전 요청의 지연 응답은 무시합니다. 동일 좌표의 성공 응답만 30초간 재사용하며, 홈·코스 목록을 벗어나면 지역 조회를 중단합니다.
- 주소 표시는 지역 조회 결과의 행정구역 명칭을 사용합니다. 지역 판정 결과는 서버·DB에 별도로 저장하지 않습니다.
- 다음 현위치 추천 개발에서 `useServiceArea().canRecommendNearby`를 사용합니다. 현재 단계에서는 추천 순위 계산을 추가하지 않았습니다.

자동 검증: `npm.cmd run test:service-area`, `npm.cmd run test:maps`. 실제 확인 시 위치를 서울·부산으로 각각 설정하고 배너 표시·해제를 확인하세요. 위치 권한 거절과 통신 실패에는 부산 외 안내 대신 재확인 안내가 나와야 합니다. 카카오 지도 키와 허용 도메인 설정은 기존 구성을 사용합니다.

API 근거: [카카오 지도 좌표→행정구역 조회](https://apis.map.kakao.com/web/documentation/#services_Geocoder_coord2RegionCode).

## 출발·도착지로 러닝 경로 찾기

홈의 **출발·도착지로 러닝 경로 찾기** 버튼이나 메뉴에서 엽니다. 출발지는 현재 위치 또는 장소·주소 검색으로 선택하고, 도착지는 검색 결과에서 선택합니다. 두 지점과 페이스를 입력하면 보행 경로, 거리, 페이스 기준 예상 시간, 경로 설명을 미리 볼 수 있습니다. **이 경로로 러닝 시작**을 누르면 기존 러닝 화면에서 안내 경로와 실제 GPS 이동을 함께 표시합니다.

실제 경로 조회에는 별도 서버와 카카오 REST API 키가 필요합니다. 지도 표시용 JavaScript 키와 구분합니다. 설정·실행·Android 연결 방법은 [server/README.md](server/README.md)를 확인하세요. 기존 GPX 코스와 자유 러닝은 계속 사용할 수 있습니다. 실행 중인 러닝이 있으면 새 경로로 덮어쓰지 않습니다. 페이스만 바꿀 때는 경로를 재조회하지 않고 시간을 다시 계산합니다.

검증: `npm.cmd run test:routing`, `npm.cmd run test:maps`, `npm.cmd run typecheck`, `npm.cmd run build`.

# 앱 전용 챗봇

홈 ESG 탭 위 챗봇 버튼에서 앱 기능과 등록 코스를 질문할 수 있습니다. OpenAI 키와 서버 실행 방법은 [챗봇 설정 안내](server/CHATBOT.md)를 참고하세요.

