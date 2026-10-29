# RUNDAY 앱 전용 RAG 챗봇

홈의 기존 고정 질문 박스를 제거하고 ESG 탭 위 원형 버튼에서 대화창을 엽니다. 닫기·뒤로가기·배경 선택 시 대화 삭제 확인창이 뜹니다. 취소하면 대화를 유지하고, 확인하면 진행 중인 요청을 취소하고 대화와 입력을 초기화합니다. 다시 열면 새 대화로 시작하며 홈을 벗어나도 대화는 사라집니다. 서버/Firestore에 대화를 저장하지 않습니다.

## 설정

`server/.env`에 아래 값을 입력한 뒤 서버를 재시작합니다. 기존 카카오 키와는 별개입니다.

```env
OPENAI_API_KEY=여기에_OpenAI_API_키
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

루트에서 `npm.cmd run routing:server`로 기존 경로 서버와 함께 실행합니다. 서버 시작 시 공개 자료를 자동 재생성합니다. Vite 개발 화면은 `/api/chat` 프록시를 사용합니다. Android/배포에서는 서버 HTTPS 주소를 `VITE_CHAT_API_URL=https://서버주소/api/chat`로 지정한 뒤 앱을 다시 빌드해야 합니다. `ALLOWED_ORIGINS`에는 실제 앱 출처를 등록합니다. 키를 `VITE_*` 변수에 넣으면 안 됩니다.

## 자료와 답변 흐름

첫 화면의 `러닝 추천받기`는 별도의 앱 내 3단계 선택 흐름입니다. 컨디션 → 평소 페이스 → 활동 종류를 받아 `src/chatbot/recommendation.ts`의 제품 기본값으로 거리·페이스·시간을 계산합니다. 이 과정은 OpenAI 호출 없이 작동하며 체력 평가나 운동 처방이 아닙니다. 피곤하면 시간은 줄이고 속도는 낮추며, 휴식 선택 시 목표를 생성하지 않습니다. 걷기 페이스는 러닝 페이스와 별개입니다. 거리 차이가 25% 이내인 GPS 안내 가능 코스가 있을 때만 카탈로그 후보를 표시합니다. 현위치 거리/현장 안전/실제 경로 계산은 이 추천에 포함되지 않습니다.

- `src/chatbot/knowledge.ts`: 코드에서 확인한 앱 사용법 7개 문서와 공통 `src/data/courses.ts`에서 가져온 코스 5개. GPS 트랙, 사용자 정보, 기록은 포함하지 않습니다.
- `npm.cmd run chat:knowledge`: 공개 텍스트만 `server/knowledge.json`으로 내보냅니다. 코스 데이터는 공통 원본에서 갱신됩니다. 기능 설명은 코드 변경 시 직접 검토해야 합니다.
- Firebase ID 토큰 검증 → 질문 범위 분류 → 질문·자료 임베딩 → 코사인 유사도 상위 5개(최소 0.25) 검색 → 검색 자료만으로 답변 → 반환된 자료 ID 검증 순서입니다.
- 임베딩은 `text-embedding-3-small`, 답변/분류는 `gpt-4.1-mini`가 기본이며 환경 변수로 변경 가능합니다. 자료 벡터는 서버 메모리에서 재사용하고 재시작하면 다시 생성합니다. 현재 12개 문서 규모에는 별도 벡터 DB를 사용하지 않습니다.
- 일반 지식, 날씨, 코딩, 의료/운동 처방, 관련 없는 혼합 요청은 범위 분류에서 거절합니다. 자료나 인용 근거가 없으면 모른다고 안내합니다. 웹 검색 도구를 제공하지 않습니다. 분류와 생성은 모델에 의존하므로 적대적인 질문에 대한 절대적인 차단을 보장하지 않습니다. 실제 모델로 회귀 평가하며 임계값을 조정해야 합니다.
- 질문 최대 800자, 최근 대화 6개, HTTP 본문 최대 20KB, 사용자당 분당 10회·동시 2회, 전체 챗봇 동시 4회입니다. 제한은 프로세스 메모리 기준이므로 여러 서버 배포 시 공유 저장소가 필요합니다.
- 질문과 최근 대화는 OpenAI에 전송합니다. Responses 요청은 `store:false`로 설정합니다. 이는 OpenAI의 전체 데이터 보관 정책을 대체하지 않습니다. 앱은 원문·토큰·키를 서버 로그에 기록하지 않습니다.

## 확인

`npm.cmd run test:chat`, `npm.cmd run typecheck`, `npm.cmd run build`로 로컬 검사를 실행합니다. 모의 OpenAI 응답 테스트는 범위 거절·검색·인용 검증·인증·오류 처리를 검사합니다. 실제 키가 없으면 모델 답변의 품질이나 계정 권한을 검증한 것은 아닙니다.

실제 키 설정 후 정상 질문(코스/위치/기록 사용법), 후속 질문, 외부 질문(날씨/코딩), 지시 무시 요청, 없는 기능·개인 기록 질문을 각각 확인해야 합니다.

공식 문서: [Responses 텍스트 생성](https://developers.openai.com/api/docs/guides/text), [구조화된 출력](https://developers.openai.com/api/docs/guides/structured-outputs), [임베딩](https://developers.openai.com/api/docs/guides/embeddings).
