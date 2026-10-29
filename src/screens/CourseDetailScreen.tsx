import { brandLogo } from '../lib/assets';
import BottomNav, { type TabId } from '../components/BottomNav';

import type { Screen } from '../App';
import { getCourse, formatCourseDistance, formatCourseDuration, formatCourseCalories } from '../data/courses';

interface Props {
  onNavigate: (screen: Screen) => void;
  courseId: number | null;
  onStartCourse: (courseId: number) => void;
}

const logo = brandLogo;

export default function CourseDetailScreen({ onNavigate, courseId, onStartCourse }: Props) {
  const course = getCourse(courseId ?? undefined);
  if (!course) return <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#edf4fb] px-4">
    <p role="alert">선택한 코스를 찾을 수 없습니다.</p>
    <button type="button" onClick={() => onNavigate('courses')} className="text-[#0570db] py-3">코스 목록으로</button>
  </div>;

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
      <div className="flex-1 min-h-0 overflow-y-auto pb-[68px]">
        {/* Headings */}
        <div className="px-4 mb-2">
          <p className="text-[12px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>{course.route ? 'GPS 안내 코스' : 'GPS 경로 준비 중'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[18px] leading-none">{course.emoji}</span>
            <p className="text-[18px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>{course.title}</p>
          </div>
          <p className="text-[12px] text-[#7b8796] mt-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
            📍 {course.district} · {formatCourseDistance(course)} · {formatCourseDuration(course)} · {formatCourseCalories(course)}
          </p>
        </div>

        {/* Map */}
        <div className="mx-4 mb-3 rounded-[18px] overflow-hidden bg-[#dde8f2] relative flex-shrink-0" style={{ height: course.previewHeight }}>
          <img src={course.mapImage} alt={course.title + ' 참고 경로 이미지'} className="absolute inset-0 w-full h-full object-cover object-center" />
          {!course.route && <div
            className="absolute bg-white border-[1.5px] border-black rounded-full px-2.5 py-0.5 drop-shadow-sm"
            style={{ right: '10%', top: '50%' }}
          >
            <span className="text-[12px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>ME</span>
          </div>}
          {!course.route && <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor1 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor1 }}>{course.title} {formatCourseDistance(course)}</span>
            </div>
            <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: course.routeColor2 }} />
              <span className="text-[9px]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.routeColor2 }}>{course.routeLabel2}</span>
            </div>
          </div>}
        </div>

        {course.route && <p className="px-4 mb-3 text-[11px] text-[#7b8796]">대표 이미지는 코스 미리보기입니다. 러닝 화면에서는 GPX 코스를 회색으로, 따라 달린 구간을 파란색으로 표시합니다.</p>}

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
          <button disabled={!course.route} onClick={() => onStartCourse(course.id)}

            className="w-full h-12 rounded-2xl text-white text-[15px] transition-opacity active:opacity-80 disabled:opacity-50"
            style={{
              fontFamily: 'Noto Sans KR',
              fontWeight: 700,
              backgroundColor: course.buttonColor,
              boxShadow: `0px 4px 12px ${course.buttonColor}55`,
            }}
          >
            {course.route ? '🏃 러닝 시작' : 'GPS 경로 준비 중'}
          </button>
        </div>
      </div>

      <BottomNav active="courses" onTabChange={handleTabChange} />
    </div>
  );
}
