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

폰트는 `src/index.css`에서 Figma의 외부 폰트 URL을 불러오므로 인터넷 연결이 필요합니다. 실제 인증과 서버 데이터 연결은 별도 개발 대상입니다. 현재 로그인 버튼은 입력값 인증 없이 홈 화면으로 이동합니다.

## 확인 명령

```powershell
npm.cmd run typecheck
npm.cmd run build
```

빌드 결과는 `dist/`에 생성됩니다.

`AGENTS.md`의 “서버가 이미 실행 중”이라는 설명은 Figma Make 내부 환경 기준입니다. 로컬에서는 위 개발 서버 명령을 직접 실행합니다. `dev:local`은 로컬 주소와 포트를 명시하고 기존 Figma 설정은 계속 사용할 수 있게 합니다.

## Firebase 연결
인증·회원 관리·배포 설정은 FIREBASE_SETUP.md를 확인하세요. 실제 Firebase 설정 전에는 로그인 버튼이 비활성화됩니다.

