# Runday 무료 Spark 운영

Firebase 프로젝트 `runday-b5df3`는 무료 Spark 요금제를 유지합니다. 결제 계정 연결이나 Blaze 전환은 필요하지 않습니다. 이번 변경으로 요금제를 변경하지 않았습니다.

## 현재 구성

- 개발 폴더: `C:\Project\Runday`
- 로컬 실행: `npm.cmd run dev:local`, http://localhost:5174/
- Authentication: 이메일/비밀번호·Google 로그인, 비밀번호 재설정 (가입 이메일 인증 생략)
- Firestore: `rundayUsers/{uid}`에 이메일·닉네임·소개·생성/수정 시각 저장
- 회원 탈퇴: 클라이언트 SDK에서 본인 재인증 → 본인 프로필 삭제 → 인증 계정 삭제
- Firebase Hosting: 정적 웹 배포 설정 준비, 아직 공개 배포하지 않음

Cloud Functions와 Cloud Storage는 실행·배포 구성에서 제외했습니다. 기존 `functions/` 폴더는 이전 서버 방식의 참고 코드이며 현재 앱이 호출하지 않습니다. 해당 폴더를 설치하거나 배포할 필요가 없습니다. 현재 삭제 기능은 Firebase 연결 여부에 따라 활성화되고, `VITE_ACCOUNT_DELETION_ENABLED` 플래그는 사용하지 않습니다.

## 탈퇴 및 오류 처리

비밀번호 회원은 현재 비밀번호로, Google 회원은 Google 팝업으로 재인증합니다. Firestore 규칙에서도 본인과 최근 5분 이내 인증 여부를 검사합니다.

DB 삭제가 실패하면 인증 계정을 삭제하지 않습니다. DB 삭제 후 인증 계정 삭제가 실패하면 탈퇴 화면에서 재시도할 수 있습니다. 같은 브라우저에서는 UID에 대한 진행 표시만 localStorage에 저장하여 새로고침 후에도 재시도 화면을 표시합니다. 비밀번호는 저장하지 않습니다.

Firestore와 Authentication 삭제는 서로 다른 작업이므로 하나의 원자적 트랜잭션은 아닙니다. 자동 백그라운드 정리 서버도 없습니다. 사용자가 중간에 브라우저를 닫거나 다른 기기로 이동하면 탈퇴를 다시 진행해야 할 수 있습니다.

현재 탈퇴가 삭제하는 범위는 **현재 앱의 러닝 기록 하위 문서·프로필 문서와 인증 계정**입니다. 사진 업로드는 아직 연결하지 않았습니다. GPS 러닝 기록 저장·조회 및 탈퇴 시 삭제는 연결했습니다. 나중에 다른 문서나 하위 컬렉션에 사용자 데이터를 저장하면 반드시 탈퇴 삭제 범위를 함께 확장해야 합니다. Firestore 문서를 삭제해도 하위 컬렉션은 자동 삭제되지 않습니다.

기존 `ddwindae-react`의 보관된 `users` 데이터는 이번 앱의 자동 탈퇴 범위가 아닙니다. 과거 계정의 데이터 이전이나 정리를 진행할 때는 별도 이관 계획이 필요합니다.

## 개발과 배포

현재 `.env.local`과 `.firebaserc`에는 실제 프로젝트 연결값이 설정되어 있습니다. 새 PC에서는 `.env.example`을 참고해 동일 프로젝트 값을 넣고 다음 명령을 실행합니다.

```powershell
cd C:\Project\Runday
npm.cmd exec --yes --package=pnpm@10.34.3 -- pnpm install --frozen-lockfile
npm.cmd run dev:local
```

확인 명령:

```powershell
npm.cmd run firebase:check
npm.cmd run typecheck
npm.cmd run build
```

웹을 공개할 때만 실행:

```powershell
firebase.cmd deploy --only "firestore:rules,hosting" --project runday-b5df3
```

Firebase CLI가 없다면 사용자가 안내한 방식으로 `npm.cmd install -g firebase-tools`를 사용합니다. 이 PC에는 이미 설치되어 있습니다. CLI 로그인이 필요하면 `firebase.cmd login`을 실행합니다.

## 무료 제공량

Spark는 무제한 서비스가 아닙니다. Authentication·Firestore·Hosting의 무료 제공량과 요청 제한 범위에서 운영합니다. 한도를 넘으면 기능이 제한될 수 있으며, 이번 구성에서는 자동으로 유료 요금제로 전환하지 않습니다.

카카오·Apple 로그인과 사진 업로드는 아직 미연결입니다. GPS 기능은 GPS_GUIDE.md를 참고하세요.

공식 문서: [Firebase 요금표](https://firebase.google.com/pricing), [웹 계정 삭제와 재인증](https://firebase.google.com/docs/auth/web/manage-users)

## 가입 이메일 인증 생략
회원가입 시 인증 메일을 보내거나 인증 완료를 기다리지 않습니다. 가입 즉시 이메일과 프로필을 Firestore에 저장하고 홈으로 이동합니다. 이후 이메일과 비밀번호로 로그인합니다. 실제 미인증 임시 계정의 가입·DB 저장·홈 진입·로그아웃·재로그인을 확인했습니다.
