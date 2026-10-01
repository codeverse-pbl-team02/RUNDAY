import { brandLogo } from '../lib/assets';
import BottomNav, { type TabId } from '../components/BottomNav';

import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
  courseId?: number;
}

const logo = brandLogo;
const mapImg = '/assets/dd208.svg';

interface CourseDetail {
  title: string;
  district: string;
  distance: string;
  duration: string;
  calories: string;
  emoji: string;
  buttonColor: string;
  routeLabel1: string;
  routeColor1: string;
  routeLabel2: string;
  routeColor2: string;
  landmark: { icon: string; title: string; spots: string; note: string };
  facility: { icon: string; title: string; desc: string };
}

const courseDetails: Record<number, CourseDetail> = {
  1: {
    title: '광안리 바다 갈매기런',
    district: '수영구',
    distance: '5.2km',
    duration: '38분',
    calories: '312kcal',
    emoji: '🌊',
    buttonColor: '#0570db',
    routeLabel1: '광안리 해안선 5.2km',
    routeColor1: '#60aedd',
    routeLabel2: '민락 루프 3.1km',
    routeColor2: '#6acf98',
    landmark: {
      icon: '📍',
      title: '랜드마크 3곳 포함',
      spots: '광안대교 뷰포인트, 수영만 요트경기장, 민락수변공원',
      note: '인증 지점이 자동 표시됩니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 공공시설물 정보',
      desc: '화장실 4곳, 음수대 2곳, 운동기구 구역 1곳을 제공합니다.',
    },
  },
  2: {
    title: '해운대 해변 돌고래런',
    district: '해운대구',
    distance: '4.5km',
    duration: '30분',
    calories: '270kcal',
    emoji: '🌅',
    buttonColor: '#00c0e8',
    routeLabel1: '해운대 비치 4.5km',
    routeColor1: '#00c0e8',
    routeLabel2: '동백 루프 2.8km',
    routeColor2: '#f5a623',
    landmark: {
      icon: '📍',
      title: '랜드마크 3곳 포함',
      spots: '해운대 해수욕장, 동백섬 누리마루, APEC나루공원',
      note: '일출 시간대 뷰포인트가 자동 표시됩니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 공공시설물 정보',
      desc: '화장실 6곳, 샤워시설 1곳, 편의점 연계 지점을 제공합니다.',
    },
  },
  3: {
    title: '낙동강 생태공원 오리런',
    district: '강서구',
    distance: '7.8km',
    duration: '55분',
    calories: '468kcal',
    emoji: '🌿',
    buttonColor: '#4caf7d',
    routeLabel1: '강서구청 루프 4.6km',
    routeColor1: '#60aedd',
    routeLabel2: '대저 생태런 6.8km',
    routeColor2: '#6acf98',
    landmark: {
      icon: '📍',
      title: '생태 랜드마크 3곳 포함',
      spots: '낙동강 하구 철새도래지, 명지시장, 신호생태공원',
      note: '인증 지점이 자동 표시됩니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 공공시설물 정보',
      desc: '운동기구 및 화장실 정보를 제공해 드립니다.',
    },
  },
  4: {
    title: '서면 생활권 하트런',
    district: '부산진구',
    distance: '3.6km',
    duration: '24분',
    calories: '216kcal',
    emoji: '🏙️',
    buttonColor: '#7b5ea7',
    routeLabel1: '서면 하트 루프 3.6km',
    routeColor1: '#7b5ea7',
    routeLabel2: '전포 연결 2.2km',
    routeColor2: '#f5a623',
    landmark: {
      icon: '📍',
      title: '생활권 랜드마크 3곳',
      spots: '서면 롯데백화점, 전포 카페거리, 부전시장',
      note: '야간 조명 구간이 자동 표시됩니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 편의시설 정보',
      desc: '카페·편의점 연계 지점, 화장실 3곳 정보를 제공합니다.',
    },
  },
  5: {
    title: '을숙도 반려견 산책런',
    district: '사하구',
    distance: '4.2km',
    duration: '35분',
    calories: '252kcal',
    emoji: '🐾',
    buttonColor: '#e07b39',
    routeLabel1: '을숙도 루프 4.2km',
    routeColor1: '#e07b39',
    routeLabel2: '강변 산책 2.5km',
    routeColor2: '#6acf98',
    landmark: {
      icon: '🐾',
      title: '반려견 친화 구간 3곳',
      spots: '을숙도 철새도래지, 낙동강 자전거길, 을숙도 생태공원',
      note: '반려견 음수대 위치가 자동 표시됩니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 공공시설물 정보',
      desc: '반려견 음수대 4곳, 분리수거함, 화장실 정보를 제공합니다.',
    },
  },
};

export default function CourseDetailScreen({ onNavigate, courseId = 1 }: Props) {
  const course = courseDetails[courseId] ?? courseDetails[1];

  const handleTabChange = (tab: TabId) => {
    if (tab === 'courses') onNavigate('courses');
    if (tab === 'home') onNavigate('home');
    if (tab === 'records') onNavigate('records' as Parameters<typeof onNavigate>[0]);
    if (tab === 'benefits') onNavigate('benefits' as Parameters<typeof onNavigate>[0]);
    if (tab === 'esg') onNavigate('esg' as Parameters<typeof onNavigate>[0]);
  };

  return (
    <div className="flex flex-col h-full bg-[#edf4fb] relative">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center h-[52px] px-3 gap-1">
        <button onClick={() => onNavigate('courses')} className="size-6 flex items-center justify-center shrink-0">
          <img src="/assets/c4f3a.svg" alt="back" className="size-full" />
        </button>
        <div className="flex-1 flex justify-center">
          <img src={logo} alt="뛴데이" className="h-8 object-contain" />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="notifications" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[68px]">
        {/* Headings */}
        <div className="px-4 mb-2">
          <p className="text-[12px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>AI 추천 코스</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[18px] leading-none">{course.emoji}</span>
            <p className="text-[18px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>{course.title}</p>
          </div>
          <p className="text-[12px] text-[#7b8796] mt-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
            📍 {course.district} · {course.distance} · {course.duration} · {course.calories}
          </p>
        </div>

        {/* Map */}
        <div className="mx-4 mb-3 rounded-[18px] overflow-hidden bg-[#dde8f2] relative h-[170px] flex-shrink-0">
          <img src={mapImg} alt="map" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute bg-white border-[1.5px] border-black rounded-full px-2.5 py-0.5 drop-shadow-sm"
            style={{ right: '10%', top: '50%' }}
          >
            <span className="text-[12px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>ME</span>
          </div>
          <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor1 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor1 }}>{course.routeLabel1}</span>
            </div>
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor2 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor2 }}>{course.routeLabel2}</span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="px-4 flex flex-col gap-2.5 mb-3">
          {/* Landmark card */}
          <div className="bg-white border border-[#d6e9f8] rounded-2xl p-3 flex gap-3 items-start">
            <div className="w-9 h-9 border border-black/20 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f0f8ff]">
              <span className="text-[18px]">{course.landmark.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-black mb-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>{course.landmark.title}</p>
              <p className="text-[12px] text-[#7b8796] leading-snug" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
                {course.landmark.spots}
              </p>
              <p className="text-[12px] text-[#60aedd] mt-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
                {course.landmark.note}
              </p>
            </div>
          </div>

          {/* Facility card */}
          <div className="bg-white border border-[#dce3f1] rounded-2xl p-3 flex gap-3 items-start">
            <div className="w-9 h-9 border border-black/20 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f5f8fc]">
              <span className="text-[18px]">{course.facility.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-black mb-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>{course.facility.title}</p>
              <p className="text-[12px] text-[#7b8796] leading-snug" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
                {course.facility.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="px-4 mb-3">
          <button onClick={() => onNavigate('running')}

            className="w-full h-12 rounded-2xl text-white text-[15px] transition-opacity active:opacity-80"
            style={{
              fontFamily: 'Noto Sans KR',
              fontWeight: 700,
              backgroundColor: course.buttonColor,
              boxShadow: `0px 4px 12px ${course.buttonColor}55`,
            }}
          >
            🏃 러닝 시작
          </button>
        </div>
      </div>

      <BottomNav active="courses" onTabChange={handleTabChange} />
    </div>
  );
}
