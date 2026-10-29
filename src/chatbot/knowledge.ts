import { courses } from '../data/courses';

export const knowledge = [
  { id: 'recommendation', title: '대화형 러닝 추천받기', text: '챗봇 첫 화면의 러닝 추천받기를 누르거나 러닝 추천받기라고 입력하면 오늘 컨디션, 평소 1km 페이스, 활동 종류(조깅/걷기·산책/가볍게 뛰기)를 차례로 선택할 수 있습니다. 선택값에 정해진 규칙을 적용해 거리, 페이스 범위, 예상 시간을 보여줍니다. 이는 체력 평가나 운동 처방이 아닌 활동 예시입니다. 쉬고 싶어요를 고르면 거리 목표를 제안하지 않습니다. 거리 차이가 추천 거리의 25% 이내인 GPS 안내 가능 등록 코스만 제안하며 출발지까지 거리나 실시간 위치를 반영하지 않습니다. 추천 다시 받기 또는 추천 그만하기를 사용할 수 있습니다.', source: 'src/chatbot/recommendation.ts' },
  { id: 'app', title: 'RUNDAY 이용 안내', text: 'RUNDAY는 부산 러닝 앱입니다. 홈에서 현재 위치 확인, 코스 탐색, 출발·도착지로 러닝 경로 찾기, 자유 러닝을 사용할 수 있습니다. 챗봇은 앱 이용과 등록 코스만 안내하며 개인 기록이나 실시간 날씨를 조회하지 않습니다.', source: 'src/screens/HomeScreen.tsx' },
  { id: 'route', title: '러닝 경로 찾기', text: '홈의 출발·도착지로 러닝 경로 찾기에서 출발지는 현재 위치 또는 장소 검색, 도착지는 장소 검색으로 선택합니다. 부산 내 출발·도착지와 목표 페이스(1km당 분·초)를 입력하고 보행 경로 찾기를 누릅니다. 카카오 도보 경로와 거리, 목표 페이스로 계산한 예상 러닝 시간을 확인하고 러닝을 시작할 수 있습니다. 교통 및 현장 안전은 확인해야 합니다. 목표 거리로 순환 코스를 자동 생성하는 기능은 없습니다.', source: 'src/screens/RoutePlannerScreen.tsx' },
  { id: 'location', title: '현재 위치와 부산 서비스 지역', text: '현재 위치 오차가 100m보다 크거나 위치 정보가 5분 이상 오래되면 위치 기반 추천을 사용할 수 없습니다. 정확한 위치 권한을 허용하고 실외에서 현재 위치 확인을 다시 눌러주세요. 장소 검색으로 출발지를 선택할 수도 있습니다. 부산 외에서는 위치 기반 부산 코스 추천이 제한되지만 부산 코스 목록 열람과 자유 러닝은 가능합니다.', source: 'src/location/serviceArea.ts' },
  { id: 'running', title: '러닝 시작과 기록 저장', text: '홈에서 자유 러닝 시작하기를 누르거나 코스 상세 또는 경로 미리보기에서 러닝을 시작합니다. 러닝 화면에서는 GPS 위치를 받아 거리와 시간을 기록하며 일시정지, 재개, 종료 후 저장이 가능합니다. 저장되지 않은 러닝이 있으면 새 경로 러닝을 바로 시작할 수 없습니다. 개인 기록은 기록 화면에서 확인하세요. 챗봇은 개인 기록을 읽거나 저장하지 않습니다.', source: 'src/running/RunProvider.tsx' },
  { id: 'map', title: '지도 조작과 화면 스크롤', text: '지도 위에서 스크롤하면 페이지가 이동합니다. 지도 이동·확대를 누르면 지도 드래그와 확대가 가능해지고 지도 조작 끝내기를 누르면 페이지 스크롤로 돌아갑니다. 현재 위치로 이동으로 내 위치를 다시 볼 수 있습니다.', source: 'src/components/CurrentLocationMap.tsx' },
  { id: 'watch', title: '스마트워치 연동 상태', text: '스마트워치 연동은 준비 중입니다. 현재 실제 스마트워치 연결이나 워치 기록 수집 기능은 제공되지 않습니다.', source: 'src/screens/HomeScreen.tsx' },
  ...courses.map(c => ({ id: `course-${c.id}`, title: c.title,
    text: `${c.title}. ${c.region} ${c.district}. 거리 ${c.distanceMeters}m. 카탈로그 예상 ${c.estimatedDurationMinutes}분(개인 페이스 미반영). 난이도 ${c.difficulty}. 태그 ${c.tags.join(', ')}. 주요 경유지 ${c.landmark.spots}. ${c.recommendationEligible ? 'GPS 안내 가능한 등록 코스입니다.' : 'GPS 경로가 없어 지도 안내 러닝 시작과 GPS 추천에서 제외되며 목록 열람만 가능합니다.'} 등록 자료이며 현장 보행 가능 여부와 안전을 보장하지 않습니다.`, source: 'src/data/courses.ts' })),
];
