from pathlib import Path
import html
import json
import zipfile
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parent
DATE = '2026-10-23'

slides = [
    {
        'title': '01. 백엔드 설계 개요', 'time': '35초',
        'message': 'Firebase 기반 BaaS로 인증·개인 기록 저장·접근 제어를 구성했습니다.',
        'bullets': [
            'Firebase Authentication: 이메일/비밀번호·Google 로그인과 사용자 UID 관리',
            'Cloud Firestore: 회원 프로필과 개인별 러닝 기록 저장',
            'Firestore Security Rules: UID 소유권과 데이터 형식·쓰기 조건 검사',
            'React 웹과 Capacitor Android 앱이 같은 Firebase 프로젝트·데이터 구조를 사용',
        ],
        'notes': '핵심은 별도 서버 운영 부담을 줄이면서 실제 계정과 러닝 기록을 연결한 것입니다. 현재 앱은 Firebase 클라이언트 SDK를 통해 관리형 백엔드에 접근합니다. 자체 Express·Spring REST 서버나 실행 중인 Cloud Functions가 있는 구조로 표현하지 않습니다.',
        'visual': '동봉한 rundy-backend-architecture.svg 사용. 중앙의 Authentication / Rules / Firestore를 강조하고 Kakao·GPS는 외부 연동으로 배치.',
        'sources': ['src/lib/firebase.ts', 'src/auth/AuthProvider.tsx', 'firebase.json', 'functions/README.md'],
    },
    {
        'title': '02. 인증과 회원 관리', 'time': '45초',
        'message': '인증 정보는 Authentication에서, 서비스 프로필은 Firestore에서 분리 관리합니다.',
        'bullets': [
            '이메일 가입·로그인·로그아웃·비밀번호 재설정 구현',
            '웹 Google 팝업 / Android 네이티브 Google 로그인 → Firebase 인증으로 연결',
            '로그인 후 UID 경로의 프로필을 트랜잭션으로 확인하고 없으면 생성',
            'onIdTokenChanged로 인증 상태, onSnapshot으로 프로필 변경을 화면에 반영',
        ],
        'notes': 'Authentication이 발급한 UID를 프로필 문서 ID로 사용해 인증 계정과 서비스 데이터를 연결합니다. 비밀번호를 직접 만든 회원 DB에 저장하지 않습니다. 로그인 유지 선택은 Firebase의 로컬·세션 지속성으로 처리합니다. 이메일 가입 시 별도 이메일 소유 인증 절차는 현재 생략합니다. Google Play 앱 서명 인증서 등록은 완료했지만 실제 Play 설치본의 로그인 성공은 제공된 증거만으로 확정하지 않습니다.',
        'visual': '이메일/Google → Firebase Authentication → UID → rundayUsers/{uid} 흐름. 프로필 예시는 가상 값 사용.',
        'sources': ['src/auth/AuthProvider.tsx:54', 'src/auth/AuthProvider.tsx:82', 'src/auth/AuthProvider.tsx:141', 'src/platform/native.ts:13'],
    },
    {
        'title': '03. DB 구조: 사용자 1명 : 러닝 기록 N개', 'time': '50초',
        'message': 'UID를 기준으로 회원과 기록을 묶어 조회와 권한 경계를 일치시켰습니다.',
        'bullets': [
            '프로필: rundayUsers/{uid} — 닉네임·소개·이메일·생성/수정 시각',
            '기록: rundayUsers/{uid}/runs/{runId} — 시작 시각·거리·활동 시간·경로 좌표',
            'runId는 러닝 시작 시 생성한 UUID, createdAt·updatedAt은 serverTimestamp 사용',
            '좌표의 segment로 일시정지·GPS 단절 전후의 경로를 구분',
        ],
        'notes': 'Firestore 문서와 하위 컬렉션으로 사용자와 기록의 일대다 관계를 표현했습니다. points는 포인트 보상이 아니라 GPS 경로 점 배열입니다. courseId는 실행 중 세션에만 있고 현재 기록 저장 문서에는 포함되지 않습니다. 코스 원본은 앱에 포함된 JSON이므로 서버 코스 테이블을 그리지 않습니다.',
        'visual': 'Authentication User(uid) ↔ rundayUsers/{uid} ── 1:N ── runs/{runId}. 정확한 필드는 부록 A 참고.',
        'sources': ['src/auth/AuthProvider.tsx:87', 'src/running/RunProvider.tsx:190', 'src/running/ActivityProvider.tsx:37', 'src/running/courseGuide.ts'],
    },
    {
        'title': '04. API 연동과 데이터 흐름', 'time': '50초',
        'message': 'SDK 기반 인증·DB 연동과 Kakao 지도 API를 역할별로 분리했습니다.',
        'bullets': [
            '회원 API: createUserWithEmailAndPassword / signInWithEmailAndPassword / signInWithCredential',
            '기록 API: runTransaction으로 생성, query + orderBy + onSnapshot으로 최신순 조회·구독',
            '지도 API: Kakao Maps JavaScript SDK로 현재 위치·실제 경로·코스 표시',
            '주소 API: Geocoder.coord2Address(경도, 위도)로 좌표를 주소로 변환',
        ],
        'notes': '발표에서 API는 직접 만든 HTTP 엔드포인트가 아니라 실제 사용하는 Firebase SDK와 외부 지도 API를 의미합니다. GPS 취득은 기기 API이고, 거리·페이스·코스 진행률 계산은 클라이언트 로직입니다. 실시간으로 DB에 GPS를 계속 전송하는 구조가 아니라 러닝 종료 후 사용자가 저장할 때 결과를 기록합니다.',
        'visual': 'GPS 취득 → 기기 내 필터·거리 계산 → 종료·저장 → Firestore → 구독 → 기록 화면. 상세 API 표는 부록 B.',
        'sources': ['src/auth/AuthProvider.tsx', 'src/running/RunProvider.tsx:190', 'src/running/ActivityProvider.tsx:36', 'src/lib/kakaoMap.ts'],
    },
    {
        'title': '05. 기록 저장의 중복 방지와 데이터 품질', 'time': '50초',
        'message': '같은 세션의 중복 저장을 막고, 기록 값의 기본 유효성을 검사합니다.',
        'bullets': [
            '클라이언트 저장 잠금 + 세션 UUID + Firestore 트랜잭션으로 재시도 시 중복 생성 방지',
            '문서가 없을 때만 생성하며, 저장된 러닝 기록의 update는 Rules에서 차단',
            'Rules에서 시간 1~86,400초·거리 0~1,000,000m·경로 점 1~3,000개 검사',
            'GPS 정확도 50m 초과·비정상 이동 속도 등은 기기에서 걸러 측정 품질 개선',
        ],
        'notes': '동일 runId에 대한 멱등성을 확보한 것이며, 다른 UUID를 사용한 동일 내용 재등록까지 모두 막는 것은 아닙니다. GPS 필터는 측정 오차를 줄이는 용도이고 서버의 운동 진위 검증이 아닙니다. Rules는 배열의 존재·개수 등을 검사하지만 각 좌표의 모든 내부 필드까지 순회 검증하지 않습니다. 따라서 현재 기록은 개인용이며 보상 지급 근거로 사용하지 않습니다.',
        'visual': '동일 runId 저장 요청 2회 → 트랜잭션 존재 확인 → 문서 1개 유지. GPS 필터는 별도 클라이언트 박스로 표시.',
        'sources': ['src/running/RunProvider.tsx:190', 'firestore.rules:37', 'src/running/RunProvider.tsx'],
    },
    {
        'title': '06. 보안과 개인정보 보호', 'time': '45초',
        'message': '서버 측 Security Rules가 본인 데이터 접근과 허용된 쓰기만 통과시킵니다.',
        'bullets': [
            'request.auth.uid와 문서 경로 UID가 같은 사용자만 본인 프로필·기록 접근',
            '전체 회원 목록 조회 차단, 정의하지 않은 문서 경로는 기본 거부',
            '필수/허용 필드·자료형·길이·서버 시각을 검사하고 임의 필드 추가 제한',
            '탈퇴 관련 삭제는 최근 5분 이내 재인증 요구, 탈퇴 상태에서는 새 기록 생성 차단',
        ],
        'notes': '접근 통제의 근거는 화면에서 버튼을 숨기는 것이 아니라 Firebase 요청에 적용되는 Rules입니다. API 키를 숨기는 것과 데이터 권한은 다른 문제입니다. 현재 사진은 로컬 선택·미리보기만 처리하고 서버 업로드는 연결하지 않았습니다. 보안 규칙의 소스 정의를 확인한 것이며 이번 자료 작성에서 운영 서버 규칙과 다시 비교한 것은 아닙니다.',
        'visual': '본인 요청 → 허용 / 타인 요청·비로그인 요청 → 거부의 2행 표. 소유권 규칙 짧은 코드 첨부.',
        'sources': ['firestore.rules', 'storage.rules', 'src/auth/deleteMemberData.ts:7', 'src/components/PhotoCapturePicker.tsx'],
    },
    {
        'title': '07. 회원 탈퇴와 실패 복구', 'time': '55초',
        'message': '삭제 순서를 설계해 잔여 데이터와 탈퇴 중 새 기록 생성을 줄였습니다.',
        'bullets': [
            '본인 재인증 → deleting=true로 기록 생성 잠금',
            'runs 하위 문서를 100개 단위로 조회하고 배치 삭제',
            '러닝 기록 삭제 → 프로필 삭제 → Authentication 계정 삭제',
            '실패 시 중단·재시도, 같은 환경의 localStorage에 탈퇴 진행 표시만 보관',
        ],
        'notes': 'Firestore에서 부모 문서를 지워도 하위 컬렉션이 자동 삭제되지 않으므로 기록을 먼저 지웁니다. DB 삭제가 실패하면 인증 계정 삭제로 넘어가지 않습니다. 한 배치의 삭제는 원자적이지만 전체 탈퇴는 여러 배치와 Authentication을 포함하므로 단일 원자적 트랜잭션이 아닙니다. 앱 종료 후 자동으로 마무리하는 백그라운드 정리 서버도 없습니다.',
        'visual': '재인증 → 잠금 → 기록 배치 삭제(반복) → 프로필 삭제 → 인증 계정 삭제. 실패 위치에서 재시도 화살표.',
        'sources': ['src/auth/AuthProvider.tsx:156', 'src/auth/deleteMemberData.ts', 'firestore.rules:5'],
    },
    {
        'title': '08. 검증 결과와 확장 방향', 'time': '50초',
        'message': '핵심 데이터 흐름은 구현했고, 검증 범위와 다음 확장 과제를 명확히 구분했습니다.',
        'bullets': [
            '자료 작성 시 TypeScript 검사 통과, 지도·경로·위치 어댑터 테스트 18개 통과',
            '기존 Android AAB 검증 기록: 번들·서명 검사 통과, lint 오류 0개',
            'Google 로그인용 업로드 키·Play 앱 서명 키 지문 등록 완료',
            '확장 과제: 기록 페이지네이션·서버 집계·자동 탈퇴 정리·서버 검증형 보상',
        ],
        'notes': '18개 테스트는 지도 로더 5개, GPX 경로 진행률 9개, 위치 어댑터 4개입니다. 백엔드 전체를 검증한 18개 통합 테스트라고 말하지 않습니다. 기존 개발 문서에는 Firebase 저장·조회·탈퇴 검증 기록이 있지만 이번 작성에서는 실서비스 데이터를 다시 생성·삭제하지 않았습니다. 장시간 실제 GPS와 Play 설치본의 Google 로그인 최종 성공은 추가 기기 검증 대상입니다.',
        'visual': '현재 완료 / 추가 검증 / 향후 확장의 3열 표. 성능 수치나 테스터 수·14일 완료 여부는 실제 측정 전 표기하지 않기.',
        'sources': ['output/presentation-tests.log', 'output/android/build-verification.json', 'GPS_GUIDE.md', 'FIREBASE_SETUP.md'],
    },
]

sections = []
def para(text): return {'type': 'p', 'text': text}
def table(headers, rows): return {'type': 'table', 'headers': headers, 'rows': rows}
def code(text): return {'type': 'code', 'text': text}
def section(title, blocks): sections.append({'title': title, 'blocks': blocks})

section('전달 요약 · PPT 제작자에게', [
    para('뛴데이(Rundy) 백엔드 발표 자료 | 기준일 '+DATE+' | 현재 작업 폴더의 코드·설정과 기존 검증 기록을 근거로 작성'),
    para('추천 구성: 본문 8장, 약 6분 20초. 각 장의 핵심 문장과 화면용 bullet을 그대로 슬라이드로 옮기고, 발표 설명은 발표자 노트에 넣으세요. 발표 시간이 3분이면 1·3·5·6·7번 중심으로 축약하세요.'),
    para('발표 소개 문장: “뛴데이는 Firebase Authentication과 Firestore를 활용해 회원 인증과 개인별 러닝 기록을 연결하고, Security Rules와 중복 저장 방지·단계적 탈퇴 처리를 적용한 러닝 앱입니다.”'),
    table(['우선순위', '발표에서 강조할 내용', '전달할 가치'], [
        ['핵심 1', 'UID 기반 인증 계정·프로필·러닝 기록 연결', '사용자별 데이터 분리'],
        ['핵심 2', 'Firestore Rules로 권한·필드·쓰기 조건 검사', '클라이언트 직접 접근 구조의 접근 통제'],
        ['핵심 3', 'UUID + 트랜잭션으로 기록 중복 저장 방지', '재시도 상황의 데이터 일관성'],
        ['핵심 4', '재인증·잠금·배치 삭제·인증 계정 삭제', '개인정보 생명주기와 실패 복구'],
        ['보조', 'Kakao 지도·주소 변환 / Android 서명 인증서 연결', '외부 서비스 연동과 배포 환경 문제 해결'],
    ]),
    para('첨부 파일: .docx는 전달·편집용, .html은 브라우저 열람·복사용, .svg는 PPT에 삽입할 아키텍처 그림입니다. 실제 개인정보, API 키, 비밀번호, 서명 개인키는 이 자료에 포함하지 않았습니다.'),
])
for slide in slides:
    section(slide['title'], [para('권장 설명 시간: '+slide['time']), para('핵심 문장 | '+slide['message'])]
            + [para('• '+b) for b in slide['bullets']]
            + [para('발표자 설명 | '+slide['notes']), para('그림·배치 제안 | '+slide['visual']), para('코드 근거 | '+' / '.join(slide['sources']))])

section('부록 A · 실제 DB 모델과 필드 사전', [
    code('Firebase Authentication\n  User(uid, email, providerData, ...)\n         │ 같은 uid\nCloud Firestore\n  rundayUsers/{uid}\n    displayName, bio, email, createdAt, updatedAt\n    dataVersion?, pointsBalance?, deleting?\n    └─ runs/{runId}  [사용자 1 : 러닝 기록 N]\n         startedAt, durationSeconds, distanceMeters, createdAt\n         points: [{latitude, longitude, timestamp, segment}, ...]'),
    table(['프로필 필드', '자료형', '실제 의미·제약'], [
        ['displayName', 'string', '닉네임. Rules: 1~30자'],
        ['bio', 'string', '소개. Rules: 100자 이하'],
        ['email', 'string', '인증 토큰 이메일과 일치해야 함'],
        ['createdAt', 'Timestamp', '프로필 생성 시 serverTimestamp. 생성 후 변경 불가'],
        ['updatedAt', 'Timestamp', '프로필 생성·수정 시 serverTimestamp'],
        ['dataVersion', 'number / 선택', '현재 신규 프로필 초기값 2. Rules에서 2로 제한'],
        ['pointsBalance', 'integer / 선택', '현재 신규 프로필 초기값 0. 사용자의 임의 적립·변경 불가'],
        ['deleting', 'boolean / 선택', '없으면 정상 상태로 취급. 재인증 후 true 전환해 탈퇴 진행'],
    ]),
    table(['러닝 필드', '자료형', '실제 의미·제약'], [
        ['문서 ID runId', 'UUID string', '러닝 시작 시 crypto.randomUUID(). 같은 세션의 저장 재시도에 재사용'],
        ['startedAt', 'number', '러닝 시작 시각, Unix epoch 밀리초. 양수, 서버 현재보다 60초 넘게 미래이면 거부'],
        ['durationSeconds', 'integer', '일시정지를 제외한 활동 시간. 저장 시 내림, 최소 1초. Rules: 1~86,400'],
        ['distanceMeters', 'integer', '기기에서 계산한 거리 반올림. Rules: 0~1,000,000'],
        ['points', 'array<map>', 'GPS 경로 점 배열. Rules: 1~3,000개. 보상 포인트가 아님'],
        ['createdAt', 'Timestamp', '기록 저장 서버 시각. serverTimestamp 사용'],
        ['points[].latitude / longitude', 'number', '각 점의 위도 / 경도. 클라이언트에서 값 범위 등 검사'],
        ['points[].timestamp', 'number', '기기 위치 샘플의 시각(epoch ms)'],
        ['points[].segment', 'number', '일시정지·재개·긴 GPS 단절에 따른 경로 구간 번호'],
    ]),
    para('모델 경계: 비밀번호는 Firestore에 없음. courseId는 Session 메모리에 있으나 runs 저장 필드에는 없음. 코스는 src/data/*.json의 정적 데이터. 배지·누적 거리·활동일은 저장된 기록을 클라이언트에서 계산. 별도 rewards/courses/rankings 테이블을 현재 운영 DB처럼 그리지 마세요.'),
    para('쿼리: query(collection(db, "rundayUsers", uid, "runs"), orderBy("startedAt", "desc"))를 onSnapshot으로 구독합니다. firestore.indexes.json에 커스텀 복합 인덱스는 없습니다. 현재 조회에 limit/cursor 페이지네이션이 없으므로 “최근 50개만 조회”라는 예전 GPS_GUIDE 문구보다 실제 코드를 우선합니다.'),
])

section('부록 B · API/SDK 기능 명세', [
    para('아래는 현재 코드에 있는 SDK 호출 명세입니다. /api/login, POST /runs 같은 자체 REST 경로는 구현하지 않았습니다.'),
    table(['기능', 'SDK/API', '입력·결과 및 책임'], [
        ['이메일 회원가입', 'createUserWithEmailAndPassword + updateProfile', 'email/password/name → 인증 계정 생성, 닉네임 지정. 클라이언트 비밀번호 8자 이상 확인'],
        ['이메일 로그인', 'signInWithEmailAndPassword', 'email/password → 인증 세션'],
        ['Google 로그인', '웹 signInWithPopup / Android FirebaseAuthentication.signInWithGoogle → signInWithCredential', 'Google 인증 결과를 Firebase 세션으로 연결. 플랫폼별 진입 경로 분리'],
        ['로그아웃·비밀번호 재설정', 'signOut / sendPasswordResetEmail', '세션 종료 / 이메일 기반 재설정 요청. 미가입 여부 노출을 줄이는 오류 처리'],
        ['프로필 생성·조회', 'doc + runTransaction + onSnapshot', '본인 UID 문서 없으면 생성. DB 프로필 변경 구독'],
        ['프로필 수정', 'updateDoc + serverTimestamp', '닉네임·소개 변경. 클라이언트 및 Rules에서 길이 검사'],
        ['러닝 저장', 'doc + runTransaction + transaction.get/set', '본인 UID + 세션 UUID. 없는 기록만 생성'],
        ['러닝 조회', 'collection + query + orderBy + onSnapshot', '본인 runs 컬렉션을 시작 시각 내림차순으로 구독'],
        ['회원 탈퇴', 'reauthenticateWithCredential/Popup + getIdToken(true) + writeBatch/deleteDoc + deleteUser', '재인증·토큰 갱신 → DB 하위 기록/프로필 정리 → 인증 계정 삭제'],
        ['현재 위치·추적', 'Capacitor Geolocation / navigator.geolocation', 'Android 네이티브 / 웹 기기 API. 서버 API가 아님'],
        ['지도 표시', 'Kakao Maps JS SDK: Map / Marker / Polyline', '현재 위치·러닝 경로·정적 코스 시각화'],
        ['좌표 → 주소', 'kakao.maps.services.Geocoder.coord2Address', '인자 순서 경도 → 위도. 도로명 주소 우선, 없으면 지번 주소'],
    ]),
    para('지도 운영 처리: SDK 중복 로드를 하나의 Promise로 합치고 15초 타임아웃·실패 후 재시도를 지원합니다. 주소 조회는 12초 타임아웃을 둡니다. Android 번들 origin https://localhost의 Kakao 허용 도메인 등록 문제를 해결했습니다. 지도 키 허용 도메인은 인증서 지문과 별개입니다.'),
])

section('부록 C · 보안 규칙과 데이터 흐름 예시', [
    table(['요청', '소스에 정의된 처리'], [
        ['로그인하지 않은 사용자 → 프로필/기록', '거부'],
        ['사용자 A → 사용자 B의 프로필/기록', '거부'],
        ['본인 프로필 단건 읽기 / 정상 프로필 수정', '규칙 조건 충족 시 허용'],
        ['전체 rundayUsers 목록 조회', '거부'],
        ['본인 신규 기록 생성', '프로필 존재 + 탈퇴 중 아님 + 허용 필드·타입·범위 충족 시 허용'],
        ['기존 러닝 기록 update', '거부'],
        ['본인 프로필·러닝 삭제', '최근 5분 이내 인증 시 허용'],
        ['그 외 미정의 문서 경로', '기본 거부'],
    ]),
    code('// 개념 설명용 축약. 실제 전체 코드는 firestore.rules 참고\nfunction owner(uid) {\n  return request.auth != null && request.auth.uid == uid;\n}\nmatch /rundayUsers/{uid} {\n  allow get: if owner(uid);\n  allow list: if false;\n  match /runs/{runId} {\n    allow read: if owner(uid);\n    allow update: if false;\n  }\n}'),
    para('러닝 저장: 위치 샘플 → 클라이언트 필터와 거리 계산 → 종료·저장 버튼 → 인증된 UID의 runs/{UUID} → Rules 검사 → 트랜잭션 커밋 → onSnapshot 이벤트 → 기록/통계 화면 갱신.'),
    para('탈퇴: 재인증 → 강제 토큰 갱신 → 로컬 진행 표시 → 프로필 deleting=true → 100건씩 배치 삭제 반복 → 프로필 삭제 → Auth 삭제 → 로컬 표시 해제. 실패하면 화면에서 재시도하며, 비밀번호는 localStorage에 넣지 않습니다.'),
    para('검증 경계: Rules는 사용자 소유권과 기본 스키마를 검사합니다. GPS 좌표 진위·거리와 경로의 일치·운동 수행 여부를 서버에서 증명하지는 않습니다. App Check·Play Integrity 검증이나 별도 관리자 API를 현재 완료 기능으로 표시하지 마세요.'),
])

section('부록 D · 구현 범위·검증 결과·향후 과제', [
    table(['구분', '현재 상태 / 발표 가능한 내용'], [
        ['구현·연결', '이메일/Google 인증, 프로필 생성·조회·수정, 개인 러닝 저장·구독, UID 기반 Rules, 재인증 기반 탈퇴'],
        ['외부 연동', 'Kakao 지도·주소 변환, 네이티브 위치·Google 인증, Google Play 인증서 지문 등록'],
        ['기기 내 처리', 'GPS 필터·거리·페이스·코스 진행률·통계 계산, 사진 촬영·선택·미리보기'],
        ['미연결', '사진 서버 업로드, Kakao/Apple 로그인, 실제 결제·보상 적립·교환 서버'],
        ['현재 사용 안 함', 'functions/의 이전 서버 방식 참고 코드, Cloud Storage 업로드. firebase.json 배포 대상에 Functions·Storage 없음'],
        ['자료 작성 시 재실행', 'TypeScript 검사 통과. 지도 5 + GPX 경로 9 + 위치 어댑터 4 = 18개 테스트 전부 통과'],
        ['기존 검증 기록', 'Android 번들·서명 검증 통과, lint 오류 0개/경고 24개. GPS_GUIDE의 Firebase 저장·조회·탈퇴 검증 기록'],
        ['추가 확인 필요', 'Play 설치본 Google 로그인 실제 성공, 다양한 Android 기기의 장시간 GPS, 실제 비공개 테스트 피드백·완료 인원'],
    ]),
    para('테스트 수치를 표현할 때: “지도·경로·위치 처리 자동 테스트 18개 통과”가 정확합니다. Rules 전체 자동 테스트, 부하 테스트, 서버 응답속도 측정, 모든 기기 검증으로 확대 해석하지 마세요. 이번 작성에서는 운영 Firestore의 실제 개인 데이터를 열람하거나 수정하지 않았고, 운영 Rules를 재다운로드해 소스와 대조하지 않았습니다.'),
    table(['향후 과제', '현재 이유와 확장 방향'], [
        ['기록 조회 확장', '현재 전체 기록 실시간 구독. 데이터 증가 시 limit + cursor 페이지네이션, 기간별 조회 도입'],
        ['통계 확장', '현재 단말에서 전체 기록 집계. 규모 증가 시 서버 집계 문서·집계 작업 검토'],
        ['자동 탈퇴 마무리', '현재 사용자 재시도 방식. 앱 종료·연결 중단에도 정리 가능한 신뢰 서버 작업 검토'],
        ['보상 시스템', 'GPS의 서버 검증·중복 수령 방지·거래 원장·관리 권한을 별도 설계한 뒤 실제 적립 연결'],
        ['사진 업로드', '소유권·파일 크기/타입·보관·탈퇴 삭제 정책과 Storage Rules를 구현한 뒤 연결'],
        ['규칙·동시성 검증', 'Emulator 기반 허용/거부 테스트와 탈퇴·기록 저장 경합 테스트 추가'],
    ]),
    para('운영 방향: 설정 문서상 Firebase Spark 무료 제공량 범위의 MVP 운영입니다. 무제한·영구 무료·고정 비용 0원이라고 발표하지 않습니다. Firebase Hosting 설정은 있으나 해당 서비스로 웹을 공개 배포했다고 단정할 자료는 없습니다. 향후 신뢰 서버 추가 시 요금제와 운영 정책을 별도 검토합니다.'),
])

section('부록 E · 예상 질문과 답변', [
    table(['질문', '발표 답변'], [
        ['서버가 없는데 백엔드인가요?', '인증·DB·권한 판정은 Firebase 관리형 백엔드가 담당합니다. 저희는 데이터 모델, SDK 연동, Security Rules, 저장·삭제 흐름을 구현했습니다.'],
        ['왜 Firebase를 선택했나요?', '현재 MVP에서 인증과 문서 DB를 빠르게 연결하고 별도 서버 운영 부담을 줄이기 위해서입니다. 비용·규모·보상 검증이 커지면 서버 기능을 추가할 수 있습니다.'],
        ['DB를 앱에서 직접 쓰면 위험하지 않나요?', '모든 요청에 UID 소유권과 쓰기 조건을 Rules로 검사합니다. 단, 기기 측정값의 진위 검증은 별도 서버 설계가 필요한 영역입니다.'],
        ['저장 버튼을 두 번 누르면요?', '클라이언트 잠금 외에도 같은 세션 UUID 경로에서 트랜잭션으로 문서 존재 여부를 확인해 하나만 생성합니다.'],
        ['부모 프로필만 삭제하면 기록도 사라지나요?', '아니요. 하위 runs를 100개씩 배치 삭제한 다음 프로필과 인증 계정을 순서대로 삭제합니다.'],
        ['실시간 GPS를 서버에 계속 올리나요?', '아니요. 운동 중에는 기기에서 측정하고, 종료 후 사용자가 저장하면 결과를 Firestore에 저장합니다.'],
        ['배경에서도 계속 러닝을 측정하나요?', '현재는 백그라운드 전환 시 일시정지합니다. 화면을 끄고 지속 추적하는 기능으로 설명하지 않습니다.'],
        ['보상 포인트·배지가 서버에 쌓이나요?', 'points는 경로 좌표입니다. 보상 잔액은 현재 신규 계정 0 초기화만 연결되며, 배지·활동 통계는 기록 기반 클라이언트 계산입니다.'],
        ['Google 로그인이 배포 후 실패하는 이유는?', '업로드 키와 Google Play 앱 서명 키가 다를 수 있습니다. Play 서명 지문도 Firebase에 등록했고 실제 설치본에서 최종 확인해야 합니다.'],
        ['탈퇴는 완전히 원자적인가요?', '한 배치의 삭제는 원자적이지만 전체 Firestore·Auth 삭제는 별개 작업입니다. 잠금과 순서, 재시도로 부분 실패를 다룹니다.'],
    ]),
])

section('부록 F · 근거 파일과 제작 체크리스트', [
    table(['근거', '확인한 내용'], [
        ['src/lib/firebase.ts', 'SDK 초기화, 인증·Firestore 연결, 개발용 Emulator 연결 조건'],
        ['src/auth/AuthProvider.tsx', '인증·프로필 트랜잭션·구독·수정·탈퇴 순서'],
        ['src/auth/deleteMemberData.ts', 'deleting 잠금, 100건 배치 삭제, 프로필 삭제'],
        ['src/running/RunProvider.tsx', 'GPS 필터·세션·UUID·중복 저장 방지·서버 시각'],
        ['src/running/ActivityProvider.tsx', '최신순 구독, 누적 거리·활동일·연속일·배지 계산'],
        ['firestore.rules / firestore.indexes.json', '소유권·재인증·필드/범위 제한, 복합 인덱스 정의 없음'],
        ['src/lib/kakaoMap.ts / src/platform/*', '지도·주소 조회, 네이티브 인증·위치 어댑터'],
        ['src/running/courseGuide.ts / src/data/*.json', 'GPX 기반 정적 코스 데이터'],
        ['firebase.json / functions/README.md / storage.rules', '배포 구성과 현재 미사용 기능 구분'],
        ['README.md / FIREBASE_SETUP.md / GPS_GUIDE.md', '설정·동작·과거 검증 기록. 상충 시 현재 코드 우선'],
        ['output/presentation-tests.log', '자료 작성 시 실행한 자동 테스트 18개 결과'],
        ['output/android/build-verification.json', '기존 AAB 검증과 앱 서명 인증서 등록 이력'],
    ]),
    para('PPT 반영 전 확인: ① 별도 REST 서버·Cloud Functions 운영으로 그리지 않았는가 ② points와 보상 잔액을 구분했는가 ③ GPS 계산과 DB 권한 검사를 구분했는가 ④ 전체 탈퇴 원자성·자동 복구를 과장하지 않았는가 ⑤ 테스트 18개의 실제 범위를 적었는가 ⑥ 실제 사용자 이메일·좌표·키가 화면에 노출되지 않는가.'),
    para('참고: 아래 공식 문서는 기술 의미를 확인하기 위한 보조 자료입니다. 프로젝트에 해당 기능을 구현했다는 근거는 위 실제 소스 파일입니다.'),
    para('Firestore Security Rules 조건: https://firebase.google.com/docs/firestore/security/rules-conditions'),
    para('Firestore 트랜잭션·배치: https://firebase.google.com/docs/firestore/manage-data/transactions'),
    para('Firebase 사용자 관리·재인증·삭제: https://firebase.google.com/docs/auth/web/manage-users'),
    para('Kakao 지도 Web API: https://apis.map.kakao.com/web/documentation/'),
])

architecture = '''<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="860" viewBox="0 0 1400 860">
<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#426582"/></marker></defs>
<rect width="1400" height="860" fill="#f5f8fc"/>
<g font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">
<text x="55" y="65" font-size="30" font-weight="700" fill="#102d49">뛴데이 · 백엔드 아키텍처</text>
<text x="55" y="101" font-size="18" fill="#526980">인증·DB·권한 판정은 Firebase / GPS 측정·계산은 기기 내부</text>
<rect x="520" y="145" width="820" height="440" rx="24" fill="#edf3ff" stroke="#c4d6f2" stroke-width="2"/>
<text x="550" y="181" font-size="21" font-weight="700" fill="#2357a3">관리형 백엔드 · Firebase</text>
<rect x="55" y="220" width="345" height="325" rx="22" fill="white" stroke="#9db6d0" stroke-width="2"/>
<text x="83" y="260" font-size="23" font-weight="700" fill="#102d49">앱 클라이언트</text>
<g font-size="19" fill="#344d65"><text x="83" y="302">React 웹 / Capacitor Android</text><text x="83" y="345">· 로그인 / 프로필 / 기록 화면</text><text x="83" y="383">· GPS 필터·거리·페이스 계산</text><text x="83" y="421">· 종료 후 사용자가 기록 저장</text><text x="83" y="459">· SDK로 DB 변경 구독</text><text x="83" y="507" font-size="16">코스 원본: 앱에 포함된 JSON</text></g>
<rect x="555" y="215" width="735" height="110" rx="16" fill="white" stroke="#9cb8df"/>
<text x="580" y="253" font-size="23" font-weight="700" fill="#2357a3">Firebase Authentication</text>
<text x="580" y="288" font-size="19" fill="#344d65">이메일·Google 로그인 → UID·인증 세션 / 재인증·계정 삭제</text>
<rect x="555" y="390" width="275" height="155" rx="16" fill="white" stroke="#9cb8df"/>
<text x="577" y="430" font-size="22" font-weight="700" fill="#2357a3">Security Rules</text>
<text x="577" y="467" font-size="18" fill="#344d65">UID 소유권 / 필드·범위</text><text x="577" y="503" font-size="18" fill="#344d65">재인증 / 탈퇴 중 쓰기 차단</text>
<rect x="900" y="390" width="390" height="155" rx="16" fill="white" stroke="#9cb8df"/>
<text x="925" y="430" font-size="23" font-weight="700" fill="#2357a3">Cloud Firestore</text>
<text x="925" y="468" font-size="19" fill="#344d65">rundayUsers/{uid}</text><text x="925" y="504" font-size="19" fill="#344d65">└ runs/{runId} · 개인별 기록</text>
<g stroke="#426582" stroke-width="2.5" fill="none" marker-end="url(#arrow)"><path d="M400 270 L550 270"/><path d="M400 470 L550 470"/><path d="M830 470 L895 470"/><path d="M690 325 L690 385"/></g>
<g font-size="16" fill="#344d65"><text x="421" y="249">로그인 요청</text><text x="416" y="446">인증된 읽기·쓰기</text><text x="711" y="358">인증 정보로 권한 판정</text></g>
<rect x="55" y="640" width="570" height="145" rx="20" fill="white" stroke="#b7d3c5" stroke-width="2"/>
<text x="80" y="679" font-size="22" font-weight="700" fill="#24654c">기기 API · GPS / 네이티브 Google 인증</text>
<text x="80" y="717" font-size="18" fill="#344d65">Capacitor Geolocation / 웹 Geolocation</text><text x="80" y="751" font-size="18" fill="#344d65">사진은 기기 내 선택·미리보기, 서버 업로드 미연결</text>
<rect x="710" y="640" width="630" height="145" rx="20" fill="white" stroke="#b7d3c5" stroke-width="2"/>
<text x="735" y="679" font-size="22" font-weight="700" fill="#24654c">외부 서비스 · Kakao Maps JavaScript SDK</text>
<text x="735" y="717" font-size="18" fill="#344d65">지도 / 마커 / 경로 표시 / 좌표 → 주소 변환</text><text x="735" y="751" font-size="18" fill="#344d65">클라이언트에서 직접 연동 · 길찾기 서버 아님</text>
<g stroke="#426582" stroke-width="2.5" fill="none" marker-end="url(#arrow)"><path d="M230 640 L230 550"/><path d="M1025 640 L1025 610 L375 610 L375 550"/></g>
<text x="55" y="828" font-size="16" fill="#526980">UID로 연결된 관리형 백엔드 구조 · 별도 REST 서버 및 현재 실행 중인 Cloud Functions 없음 · 2026-10-23 소스 기준</text>
</g></svg>'''

def render_block(b):
    if b['type'] == 'p': return '<p>'+html.escape(b['text'])+'</p>'
    if b['type'] == 'code': return '<pre>'+html.escape(b['text'])+'</pre>'
    return '<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+html.escape(h)+'</th>' for h in b['headers'])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+html.escape(c)+'</td>' for c in row)+'</tr>' for row in b['rows'])+'</tbody></table></div>'

css = '''*{box-sizing:border-box}body{margin:0;background:#eef3f9;color:#182f46;font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:15px;line-height:1.8}header{padding:46px max(24px,calc((100vw - 1040px)/2));background:#122f4d;color:white}header p{color:#c9ddf5}h1{font-size:32px;margin:0}main{max-width:1100px;margin:auto;padding:28px}section{background:white;padding:30px 36px;margin-bottom:24px;border-radius:16px;border:1px solid #d9e3ef}h2{font-size:24px;color:#1555a4;margin:0 0 20px}p{margin:10px 0;overflow-wrap:anywhere}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px;line-height:1.6;margin:20px 0}td,th{border:1px solid #d4e0ee;padding:10px 12px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#eaf2fe;color:#174a85}tbody tr:nth-child(even){background:#f8fafc}pre{white-space:pre-wrap;background:#f0f5fb;border-left:4px solid #3172bd;padding:20px;font-size:13px;line-height:1.7;overflow-wrap:anywhere}nav a{color:#1d5eaa;display:inline-block;margin:3px 16px 3px 0}svg{max-width:100%;height:auto}.diagram{padding:14px;background:#f5f8fc;border-radius:16px;margin:20px 0}@media print{body{background:white;font-size:10pt}header{padding:16px;color:#183d66;background:white}header p{color:#455d75}main{padding:0;max-width:none}nav{display:none}section{border:0;border-radius:0;padding:12px 4px;break-before:page;margin:0}section:first-child{break-before:auto}h2{font-size:18pt}table{font-size:8.5pt}tr{break-inside:avoid}pre{font-size:9pt}}'''
nav = '<nav>'+''.join(f'<a href="#s{i}">{html.escape(s["title"])}</a>' for i,s in enumerate(sections))+'</nav>'
body = ''.join(f'<section id="s{i}"><h2>{html.escape(s["title"])}</h2>'+('' if i else '<div class="diagram">'+architecture+'</div>')+''.join(render_block(b) for b in s['blocks'])+'</section>' for i,s in enumerate(sections))
page = '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>뛴데이 백엔드 발표 제작 자료</title><style>'+css+'</style><header><h1>뛴데이 · 백엔드 발표 제작 자료</h1><p>본문 8장 + DB·API·보안·예상 질문 부록 | '+DATE+'</p></header><main>'+nav+body+'</main></html>'
(OUT/'rundy-backend-ppt-handoff.html').write_text(page, encoding='utf-8')
(OUT/'rundy-backend-architecture.svg').write_text(architecture, encoding='utf-8')

# Word handoff document, authored with standard Open XML (no extra dependencies).
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
def run(text):
    return '<w:r><w:t xml:space="preserve">'+escape(text)+'</w:t></w:r>'
def wp(text, style=None, page_before=False):
    props = (f'<w:pStyle w:val="{style}"/>' if style else '')+('<w:pageBreakBefore/>' if page_before else '')
    return '<w:p>'+('<w:pPr>'+props+'</w:pPr>' if props else '')+run(text)+'</w:p>'
def wt(b):
    rows = [b['headers']]+b['rows']
    out = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/></w:tblPr>'
    widths = [1800, 2800, 4800] if len(b['headers']) == 3 else [2300, 7100]
    out += '<w:tblGrid>'+''.join(f'<w:gridCol w:w="{n}"/>' for n in widths)+'</w:tblGrid>'
    for i,row in enumerate(rows):
        out += '<w:tr><w:trPr><w:cantSplit/>'+('<w:tblHeader/>' if i==0 else '')+'</w:trPr>'
        for j,cell in enumerate(row):
            shade = '<w:shd w:fill="EAF2FE"/>' if i==0 else ''
            out += f'<w:tc><w:tcPr><w:tcW w:w="{widths[j]}" w:type="dxa"/>{shade}</w:tcPr>'+wp(cell,'TableText')+'</w:tc>'
        out += '</w:tr>'
    return out+'</w:tbl>'+wp('')
docbody = wp('뛴데이 백엔드 발표 제작 자료','Title')+wp('본문 8장 + API·DB·보안·예상 질문 부록 | '+DATE,'Subtitle')
for i,s in enumerate(sections):
    docbody += wp(s['title'], 'Heading1', page_before=i>0)
    for b in s['blocks']:
        if b['type']=='table': docbody += wt(b)
        elif b['type']=='code':
            for line in b['text'].splitlines(): docbody += wp(line,'Code')
        else: docbody += wp(b['text'])
docbody += '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1050" w:right="1050" w:bottom="1050" w:left="1050"/></w:sectPr>'
document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="{W}"><w:body>{docbody}</w:body></w:document>'
styles = f'''<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="{W}">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="맑은 고딕"/><w:sz w:val="21"/><w:lang w:val="ko-KR" w:eastAsia="ko-KR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="130" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="123A61"/><w:sz w:val="40"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="58718B"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="180" w:after="260"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="1555A4"/><w:sz w:val="30"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="70" w:line="260" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:shd w:fill="F0F5FB"/></w:pPr><w:rPr><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D4E0EE"/><w:left w:val="single" w:sz="4" w:color="D4E0EE"/><w:bottom w:val="single" w:sz="4" w:color="D4E0EE"/><w:right w:val="single" w:sz="4" w:color="D4E0EE"/><w:insideH w:val="single" w:sz="4" w:color="D4E0EE"/><w:insideV w:val="single" w:sz="4" w:color="D4E0EE"/></w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>'''
content_types = '''<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'''
rels = '''<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'''
doc_rels = '''<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'''
with zipfile.ZipFile(OUT/'rundy-backend-ppt-handoff.docx','w',zipfile.ZIP_DEFLATED) as z:
    for name, data in {'[Content_Types].xml':content_types, '_rels/.rels':rels, 'word/document.xml':document, 'word/styles.xml':styles, 'word/_rels/document.xml.rels':doc_rels}.items(): z.writestr(name,data.encode('utf-8'))

(OUT/'handoff-content.json').write_text(json.dumps({'date':DATE,'slides':slides,'sections':sections},ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(OUT/'rundy-backend-presentation-handoff.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in ['rundy-backend-ppt-handoff.docx','rundy-backend-ppt-handoff.html','rundy-backend-architecture.svg']:
        z.write(OUT/name,arcname=name)
print(json.dumps({'slideCount':len(slides),'sectionCount':len(sections),'files':[str(p) for p in OUT.iterdir() if p.suffix in ('.docx','.html','.svg','.zip')]},ensure_ascii=False,indent=2))
