import dogRouteData from './gwangan-dangdang-route.json';
import seagullRouteData from './gwangan-seagull-route.json';
import snailRouteData from './haeundae-snail-route.json';
import yachtRouteData from './seomyeon-yacht-route.json';

export interface GeoPoint { latitude: number; longitude: number }
export interface CourseRoute {
  source: 'provided-gpx';
  shape: 'loop' | 'point-to-point';
  points: GeoPoint[];
}
export interface Course {
  id: number;
  title: string;
  image: string;
  mapImage: string;
  previewHeight: number;
  region: string;
  district: string;
  distanceMeters: number;
  distanceSource: 'provided-gpx' | 'catalog-estimate';
  // Retain the catalog estimates; they are not personalized pace calculations.
  estimatedDurationMinutes: number;
  estimatedCaloriesKcal: number;
  category: string;
  categoryColor: string;
  categoryBg: string;
  difficulty: string;
  difficultyColor: string;
  difficultyBg: string;
  rating: number | null;
  emoji: string;
  tags: string[];
  buttonColor: string;
  routeColor1: string;
  routeColor2: string;
  routeLabel2: string;
  landmark: { icon: string; title: string; spots: string; note: string };
  facility: { icon: string; title: string; desc: string };
  route: CourseRoute | null;
  startPoint: GeoPoint | null;
  // Imported GPX allows catalog recommendations, not a guarantee of road safety.
  recommendationEligible: boolean;
}

function makeRoute(data: { coordinates: number[][] }, shape: CourseRoute['shape']): CourseRoute {
  return { source: 'provided-gpx', shape,
    points: data.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })) };
}

const definitions: Omit<Course, 'startPoint' | 'recommendationEligible'>[] = [
  {
    "id": 1,
    "image": "/assets/gwangan-dangdang-route.png",
    "category": "관광",
    "categoryColor": "#60aedd",
    "categoryBg": "rgba(96,174,221,0.13)",
    "difficulty": "보통",
    "difficultyColor": "#f5a623",
    "difficultyBg": "rgba(245,166,35,0.13)",
    "rating": 4.9,
    "emoji": "🐕",
    "title": "광안리 댕댕 RUN",
    "district": "수영구",
    "tags": [
      "반려견",
      "평지 코스",
      "광안리"
    ],
    "buttonColor": "#0570db",
    "region": "부산광역시",
    "distanceMeters": dogRouteData.reportedDistanceMeters,
    "distanceSource": "provided-gpx",
    "estimatedDurationMinutes": 26,
    "estimatedCaloriesKcal": 270,
    "routeColor1": "#60aedd",
    "routeLabel2": "출발·도착 민락수변공원",
    "routeColor2": "#6acf98",
    "landmark": {
      "icon": "📍",
      "title": "주요 경유지",
      "spots": "민락수변공원 공영주차장 → 런더너호텔 → 민락동행정복지센터 → 민락회타운 → e편한세상광안비치 → 출발점",
      "note": "제공된 GPX 경로를 지도 안내에 사용합니다."
    },
    "facility": {
      "icon": "🏪",
      "title": "주변 공공시설물 정보",
      "desc": "현장 시설과 보행 가능한 길을 확인하며 달려주세요."
    },
    "mapImage": "/assets/gwangan-dangdang-route.png",
    "previewHeight": 170,
    "route": makeRoute(dogRouteData, 'loop')
  },
  {
    "id": 2,
    "image": "/assets/gwangan-seagull-route.png",
    "category": "관광",
    "categoryColor": "#60aedd",
    "categoryBg": "rgba(96,174,221,0.13)",
    "difficulty": "보통",
    "difficultyColor": "#f5a623",
    "difficultyBg": "rgba(245,166,35,0.13)",
    "rating": null,
    "emoji": "🐦",
    "title": "광안리 갈매기 RUN",
    "district": "수영구",
    "tags": [
      "광안리",
      "해안 코스",
      "평지 코스"
    ],
    "buttonColor": "#00c0e8",
    "region": "부산광역시",
    "distanceMeters": seagullRouteData.reportedDistanceMeters,
    "distanceSource": "provided-gpx",
    "estimatedDurationMinutes": 32,
    "estimatedCaloriesKcal": 260,
    "routeColor1": "#00c0e8",
    "routeLabel2": "수영로 576 순환",
    "routeColor2": "#f5a623",
    "landmark": {
      "icon": "📍",
      "title": "광안리 해안 순환 코스",
      "spots": "수영로 576에서 출발해 광안리 해안과 주변 도로를 거쳐 출발점으로 돌아옵니다.",
      "note": "제공된 GPX 경로를 지도 안내에 사용합니다."
    },
    "facility": {
      "icon": "🏪",
      "title": "현장 시설 안내",
      "desc": "통행 가능한 길과 주변 시설은 현장에서 확인해 주세요."
    },
    "mapImage": "/assets/gwangan-seagull-route.png",
    "previewHeight": 400,
    "route": makeRoute(seagullRouteData, 'loop')
  },
  {
    "id": 3,
    "image": "/assets/haeundae-snail-route.png",
    "category": "관광",
    "categoryColor": "#60aedd",
    "categoryBg": "rgba(96,174,221,0.13)",
    "difficulty": "중급",
    "difficultyColor": "#f5a623",
    "difficultyBg": "rgba(245,166,35,0.13)",
    "rating": null,
    "emoji": "🐌",
    "title": "해운대 달팽이 RUN",
    "district": "해운대구",
    "tags": [
      "업다운힐",
      "체력 소모 큼",
      "GPX 안내"
    ],
    "buttonColor": "#0570db",
    "region": "부산광역시",
    "distanceMeters": snailRouteData.reportedDistanceMeters,
    "distanceSource": "provided-gpx",
    "estimatedDurationMinutes": 191,
    "estimatedCaloriesKcal": 623,
    "routeColor1": "#60aedd",
    "routeLabel2": "중동 1783-2 → 좌동 995",
    "routeColor2": "#6acf98",
    "landmark": {
      "icon": "📍",
      "title": "해운대 업다운힐 코스",
      "spots": "해운대구 중동 1783-2에서 출발해 해운대와 좌동 일대를 거쳐 좌동 995에 도착합니다.",
      "note": "체력 소모가 큰 중급자 코스입니다. 제공된 GPX 경로를 지도 안내에 사용합니다."
    },
    "facility": {
      "icon": "⛰️",
      "title": "고도 변화 안내",
      "desc": "GPX 기준 총 상승 144m·총 하강 122m입니다. 오르막과 내리막에서 페이스를 조절해 주세요."
    },
    "mapImage": "/assets/haeundae-snail-route.png",
    "previewHeight": 170,
    "route": makeRoute(snailRouteData, 'point-to-point')
  },
  {
    "id": 4,
    "image": "/assets/seomyeon-yacht-route.png",
    "category": "생활권",
    "categoryColor": "#7b5ea7",
    "categoryBg": "rgba(123,94,167,0.13)",
    "difficulty": "GPS 안내",
    "difficultyColor": "#0570db",
    "difficultyBg": "rgba(5,112,219,0.13)",
    "rating": null,
    "emoji": "⛵",
    "title": "서면 요트 RUN",
    "district": "부산진구",
    "tags": [
      "서면",
      "순환 코스",
      "GPX 안내"
    ],
    "buttonColor": "#7b5ea7",
    "region": "부산광역시",
    "distanceMeters": yachtRouteData.reportedDistanceMeters,
    "distanceSource": "provided-gpx",
    "estimatedDurationMinutes": 40,
    "estimatedCaloriesKcal": 327,
    "routeColor1": "#7b5ea7",
    "routeLabel2": "전포동 888 출발·도착",
    "routeColor2": "#f5a623",
    "landmark": {
      "icon": "📍",
      "title": "서면 순환 코스",
      "spots": "전포동 888에서 출발해 서면역과 부전역 인근을 거쳐 출발점으로 돌아옵니다.",
      "note": "제공된 GPX 경로를 지도 안내에 사용합니다."
    },
    "facility": {
      "icon": "🏪",
      "title": "현장 시설 안내",
      "desc": "통행 가능한 길과 주변 시설은 현장에서 확인해 주세요."
    },
    "mapImage": "/assets/seomyeon-yacht-route.png",
    "previewHeight": 170,
    "route": makeRoute(yachtRouteData, 'loop')
  },
  {
    "id": 5,
    "image": "/assets/3f40a.png",
    "category": "반려견",
    "categoryColor": "#e07b39",
    "categoryBg": "rgba(224,123,57,0.13)",
    "difficulty": "쉬움",
    "difficultyColor": "#4caf7d",
    "difficultyBg": "rgba(76,175,125,0.13)",
    "rating": 4.6,
    "emoji": "🐾",
    "title": "을숙도 반려견 산책런",
    "district": "사하구",
    "tags": [
      "반려견 필수",
      "잔디밭",
      "분수공원"
    ],
    "buttonColor": "#e07b39",
    "region": "부산광역시",
    "distanceMeters": 4200,
    "distanceSource": "catalog-estimate",
    "estimatedDurationMinutes": 35,
    "estimatedCaloriesKcal": 252,
    "routeColor1": "#e07b39",
    "routeLabel2": "강변 산책 2.5km",
    "routeColor2": "#6acf98",
    "landmark": {
      "icon": "🐾",
      "title": "반려견 친화 구간 3곳",
      "spots": "을숙도 철새도래지, 낙동강 자전거길, 을숙도 생태공원",
      "note": "GPS 경로는 준비 중입니다. 방문 전 현장 통행 가능 여부를 확인해 주세요."
    },
    "facility": {
      "icon": "🏪",
      "title": "주변 공공시설물 정보",
      "desc": "시설 위치는 아직 확인되지 않았습니다. 현장에서 확인해 주세요."
    },
    "mapImage": "/assets/dd208.svg",
    "previewHeight": 170,
    "route": null
  }
];

function validPoint(point: GeoPoint) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

export const courses: readonly Course[] = definitions.map(course => {
  const validRoute = Boolean(course.route && course.route.points.length > 1 && course.route.points.every(validPoint));
  return { ...course, startPoint: validRoute ? course.route!.points[0] : null,
    recommendationEligible: validRoute && course.distanceMeters > 0 };
});

export function getCourse(id?: number): Course | null {
  return courses.find(course => course.id === id) ?? null;
}

export function getRecommendableCourses(): Course[] {
  return courses.filter(course => course.recommendationEligible);
}

// An editorial selection until location-based ranking is implemented.
export const featuredCourse = getRecommendableCourses()[0];

export function formatCourseDistance(course: Course): string {
  return Number((course.distanceMeters / 1000).toFixed(2)) + 'km';
}

export function formatCourseDuration(course: Course): string {
  const hours = Math.floor(course.estimatedDurationMinutes / 60);
  const minutes = course.estimatedDurationMinutes % 60;
  return hours ? '약 ' + hours + '시간' + (minutes ? ' ' + minutes + '분' : '') : '약 ' + minutes + '분';
}

export function formatCourseCalories(course: Course): string {
  return '약 ' + course.estimatedCaloriesKcal + 'kcal';
}

export function estimateRunningMinutes(course: Course, paceMinutesPerKm: number): number | null {
  if (!Number.isFinite(paceMinutesPerKm) || paceMinutesPerKm <= 0) return null;
  return Math.ceil(course.distanceMeters / 1000 * paceMinutesPerKm);
}
