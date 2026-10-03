import { brandLogo } from '../lib/assets';
import BottomNav, { type TabId } from '../components/BottomNav';

import type { Screen } from '../App';
import { gwanganDogGuide, gwanganSeagullGuide, haeundaeSnailGuide, seomyeonYachtGuide } from '../running/courseGuide';

interface Props {
  onNavigate: (screen: Screen) => void;
  courseId?: number;
  onStartCourse: (courseId: number) => void;
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
    title: '광안리 댕댕 RUN',
    district: '수영구',
    distance: '4.04km',
    duration: '약 26분',
    calories: '약 270kcal',
    emoji: '🐕',
    buttonColor: '#0570db',
    routeLabel1: '광안리 댕댕 RUN 4.04km',
    routeColor1: '#60aedd',
    routeLabel2: '출발·도착 민락수변공원',
    routeColor2: '#6acf98',
    landmark: {
      icon: '📍',
      title: '주요 경유지',
      spots: '민락수변공원 공영주차장 → 런더너호텔 → 민락동행정복지센터 → 민락회타운 → e편한세상광안비치 → 출발점',
      note: '제공된 GPX 경로를 지도 안내에 사용합니다.',
    },
    facility: {
      icon: '🏪',
      title: '주변 공공시설물 정보',
      desc: '현장 시설과 보행 가능한 길을 확인하며 달려주세요.',
    },
  },
  2: {
    title: '광안리 갈매기 RUN',
    district: '수영구',
    distance: '4.13km',
    duration: '약 32분',
    calories: '약 260kcal',
    emoji: '🐦',
    buttonColor: '#00c0e8',
    routeLabel1: '광안리 갈매기 RUN 4.13km',
    routeColor1: '#00c0e8',
    routeLabel2: '수영로 576 순환',
    routeColor2: '#f5a623',
    landmark: {
      icon: '📍',
      title: '광안리 해안 순환 코스',
      spots: '수영로 576에서 출발해 광안리 해안과 주변 도로를 거쳐 출발점으로 돌아옵니다.',
      note: '제공된 GPX 경로를 지도 안내에 사용합니다.',
    },
    facility: {
      icon: '🏪',
      title: '현장 시설 안내',
      desc: '통행 가능한 길과 주변 시설은 현장에서 확인해 주세요.',
    },
  },
  3: {
    title: '해운대 달팽이 RUN',
    district: '해운대구',
    distance: '11.4km',
    duration: '약 3시간 11분',
    calories: '약 623kcal',
    emoji: '🐌',
    buttonColor: '#0570db',
    routeLabel1: '해운대 달팽이 RUN 11.4km',
    routeColor1: '#60aedd',
    routeLabel2: '중동 1783-2 → 좌동 995',
    routeColor2: '#6acf98',
    landmark: {
      icon: '📍',
      title: '해운대 업다운힐 코스',
      spots: '해운대구 중동 1783-2에서 출발해 해운대와 좌동 일대를 거쳐 좌동 995에 도착합니다.',
      note: '체력 소모가 큰 중급자 코스입니다. 제공된 GPX 경로를 지도 안내에 사용합니다.',
    },
    facility: {
      icon: '⛰️',
      title: '고도 변화 안내',
      desc: 'GPX 기준 총 상승 144m·총 하강 122m입니다. 오르막과 내리막에서 페이스를 조절해 주세요.',
    },
  },
  4: {
    title: '서면 요트 RUN',
    district: '부산진구',
    distance: '5.98km',
    duration: '약 40분',
    calories: '약 327kcal',
    emoji: '⛵',
    buttonColor: '#7b5ea7',
    routeLabel1: '서면 요트 RUN 5.98km',
    routeColor1: '#7b5ea7',
    routeLabel2: '전포동 888 출발·도착',
    routeColor2: '#f5a623',
    landmark: {
      icon: '📍',
      title: '서면 순환 코스',
      spots: '전포동 888에서 출발해 서면역과 부전역 인근을 거쳐 출발점으로 돌아옵니다.',
      note: '제공된 GPX 경로를 지도 안내에 사용합니다.',
    },
    facility: {
      icon: '🏪',
      title: '현장 시설 안내',
      desc: '통행 가능한 길과 주변 시설은 현장에서 확인해 주세요.',
    },
  },
  5: {
    title: '을숙도 반려견 산책런',
    district: '사하구',
    distance: '4.2km',
    duration: '약 35분',
    calories: '약 252kcal',
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

export default function CourseDetailScreen({ onNavigate, courseId = 1, onStartCourse }: Props) {
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
          <p className="text-[12px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>{courseId === 2 || courseId === 3 || courseId === 4 ? 'GPS 안내 코스' : 'AI 추천 코스'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[18px] leading-none">{course.emoji}</span>
            <p className="text-[18px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>{course.title}</p>
          </div>
          <p className="text-[12px] text-[#7b8796] mt-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
            📍 {course.district} · {course.distance} · {course.duration} · {course.calories}
          </p>
        </div>

        {/* Map */}
        <div className={`mx-4 mb-3 rounded-[18px] overflow-hidden bg-[#dde8f2] relative ${courseId === 2 ? 'h-[400px]' : 'h-[170px]'} flex-shrink-0`}>
          <img src={courseId === 1 ? gwanganDogGuide.referenceImage : courseId === 2 ? gwanganSeagullGuide.referenceImage : courseId === 3 ? haeundaeSnailGuide.referenceImage : courseId === 4 ? seomyeonYachtGuide.referenceImage : mapImg} alt={courseId === 1 ? '광안리 댕댕 RUN 참고 경로' : courseId === 2 ? '광안리 갈매기 RUN 대표 경로 이미지' : courseId === 3 ? '해운대 달팽이 RUN 대표 경로 이미지' : courseId === 4 ? '서면 요트 RUN 대표 경로 이미지' : '코스 참고 지도'} className="absolute inset-0 w-full h-full object-cover object-center" />
          {courseId === 5 && <div
            className="absolute bg-white border-[1.5px] border-black rounded-full px-2.5 py-0.5 drop-shadow-sm"
            style={{ right: '10%', top: '50%' }}
          >
            <span className="text-[12px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>ME</span>
          </div>}
          {courseId === 5 && <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor1 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor1 }}>{course.routeLabel1}</span>
            </div>
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor2 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor2 }}>{course.routeLabel2}</span>
            </div>
          </div>}
        </div>
        {courseId === 1 && <p className="px-4 mb-3 text-[11px] text-[#7b8796]">대표 이미지는 코스 미리보기입니다. 러닝 화면에서는 GPX 코스를 회색으로, 따라 달린 구간을 파란색으로 표시합니다.</p>}
        {courseId === 2 && <p className="px-4 mb-3 text-[11px] text-[#7b8796]">러닝 화면에서 GPX 코스는 회색, 따라 달린 구간은 파란색으로 표시됩니다. 대표 이미지는 코스 미리보기입니다.</p>}
        {courseId === 3 && <p className="px-4 mb-3 text-[11px] text-[#7b8796]">대표 이미지는 코스 미리보기입니다. 러닝 화면에서는 GPX 코스를 회색으로, 따라 달린 구간을 파란색으로 표시합니다.</p>}
        {courseId === 4 && <p className="px-4 mb-3 text-[11px] text-[#7b8796]">대표 이미지는 코스 미리보기입니다. 러닝 화면에서는 GPX 코스를 회색으로, 따라 달린 구간을 파란색으로 표시합니다.</p>}

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
          <button onClick={() => onStartCourse(courseId)}

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
