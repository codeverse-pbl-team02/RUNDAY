import { brandLogo } from '../lib/assets';
import { useEffect, useRef, useState } from 'react';
import BottomNav, { type TabId } from '../components/BottomNav';
import { CurrentLocationMap } from '../components/CurrentLocationMap';
import { useRun } from '../running/RunProvider';
import { useBackAction } from '../navigation/useBackAction';
import { courses, getCourse, formatCourseDistance, formatCourseDuration, formatCourseCalories } from '../data/courses';

type Screen = 'login' | 'home' | 'courses' | 'course-detail';

interface Props {
  onNavigate: (screen: Screen) => void;
  onSelectCourse: (id: number) => void;
}

const logo = brandLogo;
const bookmarkIcon = '/assets/abf88.svg';

const filters = ['전체', '생활권', '관광', '반려견'];

const avatarImg = '/assets/ad867.svg';

interface Comment {
  user: string;
  lines: string[];
}

interface CourseComments {
  count: string;
  comments: Comment[];
}

const courseComments: Record<number, CourseComments> = {
  1: {
    count: '138명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['광안대교를 향해 뛰어가다 보면 너무 상쾌하고 좋아요~', '중심지와는 달라서 뛰기 좋네요!'] },
      { user: 'User 2', lines: ['광안리 여행 버킷리스트가 러닝이었는데, 꿈 같은 시간이었어요... 추천합니다!'] },
      { user: 'User 3', lines: ['평지라 뛰기 좋음 ㅋㅋㅋ'] },
    ],
  },
  2: {
    count: '아직 등록된 댓글이 없습니다.',
    comments: [],
  },
  3: {
    count: '아직 등록된 댓글이 없습니다.',
    comments: [],
  },
  4: {
    count: '아직 등록된 댓글이 없습니다.',
    comments: [],
  },
  5: {
    count: '39명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['우리집 강아지 귀여워'] },
      { user: 'User 2', lines: ['저희 강아지가 아직 아기라 산책 경험이 많이 없는데 이 코스로 뛰니까 위험한 상황이 없어서 좋아요.'] },
      { user: 'User 3', lines: ['저 이 코스로 10번 넘게 산책해왔는데 지금은 저희 강쥐한테 친구도 생겼어염!!! 강아지 키우시는 분들 많이 이용하세욥~'] },
    ],
  },
};

export default function CourseListScreen({ onNavigate, onSelectCourse }: Props) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [commentsFor, setCommentsFor] = useState<number | null>(null);
  useBackAction(commentsFor !== null, () => setCommentsFor(null));
  const run = useRun();
  const locationRequested = useRef(false);
  const coursesStart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (locationRequested.current || run.locating || run.mode === 'running' || run.mode === 'locating') return;
    locationRequested.current = true;
    run.locate();
  }, [run.locating, run.mode, run.locate]);

  const handleTabChange = (tab: TabId) => {
    if (tab === 'courses') return;
    if (tab === 'home') onNavigate('home');
    if (tab === 'records') onNavigate('records' as Parameters<typeof onNavigate>[0]);
    if (tab === 'benefits') onNavigate('benefits' as Parameters<typeof onNavigate>[0]);
    if (tab === 'esg') onNavigate('esg' as Parameters<typeof onNavigate>[0]);
  };

  const filteredCourses = activeFilter === '전체'
    ? courses
    : courses.filter(c => c.category === activeFilter);

  return (
    <div className="flex flex-col h-full bg-[#edf4fb] relative">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center h-[56px] px-3 gap-1">
        <button onClick={() => onNavigate('home')} className="size-6 flex items-center justify-center shrink-0">
          <img src="/assets/c4f3a.svg" alt="back" className="size-full" />
        </button>
        <div className="flex-1 flex justify-center">
          <img src={logo} alt="뛴데이" className="h-9 object-contain" />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="notifications" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      {/* Scrollable course content */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[72px]" style={{ scrollbarGutter: 'stable' }}>
      {/* Subtitle */}
      <p className="px-4 text-[12px] text-[#b4b4b4] mb-3" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
        AI가 제공하는 나만의 코스를 경험할 수 있어요
      </p>

      {/* Current location map */}
      <div className="mx-4 mb-3">
        <CurrentLocationMap showLocationButton onBrowseCourses={() => {
          setActiveFilter('전체');
          coursesStart.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }} />
      </div>

      {/* Filter tabs */}
      <div ref={coursesStart} className="flex-shrink-0 flex gap-2 px-4 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="flex-shrink-0 h-[34px] px-4 rounded-full text-[12px] transition-colors"
            style={{
              fontFamily: 'Noto Sans KR',
              fontWeight: 900,
              backgroundColor: activeFilter === f ? '#0570db' : 'white',
              color: activeFilter === f ? 'white' : '#7b8796',
              border: activeFilter === f ? 'none' : '1px solid #dce3f1',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course cards */}
      <div className="px-4 flex flex-col gap-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="shrink-0 bg-white border border-[#dce3f1] rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Course image */}
            <div className={`relative ${course.id === 2 ? 'h-[190px] bg-[#d9eefa]' : 'h-[130px]'}`}>
              <img src={course.image} alt={course.title} className="w-full h-full object-cover object-center" />
              <button className="absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm bg-white/80 shadow flex items-center justify-center">
                <img src={bookmarkIcon} alt="" className="w-3.5 h-3.5" />
              </button>
              {/* Emoji badge */}
              <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                <span className="text-[14px] leading-none">{course.emoji}</span>
              </div>
            </div>

            {/* Course info */}
            <div className="px-3 pt-2.5 pb-3">
              {/* Tags row */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.categoryColor, backgroundColor: course.categoryBg }}>
                  {course.category}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, color: course.difficultyColor, backgroundColor: course.difficultyBg }}>
                  {course.difficulty}
                </span>
                {course.rating !== null && <><span className="text-[10px] text-[#ffb800] leading-none">★</span>
                  <span className="text-[10px] text-[#3d4a5c]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{course.rating}</span></>}
                <span className="ml-auto text-[10px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>📍 {course.district}</span>
              </div>

              {/* Title */}
              <h3 className="text-[14px] text-[#1a2535] mb-2" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>
                {course.title}
              </h3>

              {/* Stats row */}
              <div className="flex gap-0 mb-2 bg-[#f5f8fc] rounded-xl overflow-hidden">
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{formatCourseDistance(course)}</p>
                  <p className="text-[9px] text-[#9baab8]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>거리</p>
                </div>
                <div className="w-px bg-[#dce3f1]" />
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{formatCourseDuration(course)}</p>
                  <p className="text-[9px] text-[#9baab8]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>시간</p>
                </div>
                <div className="w-px bg-[#dce3f1]" />
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{formatCourseCalories(course)}</p>
                  <p className="text-[9px] text-[#9baab8]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>칼로리</p>
                </div>
              </div>

              {/* Feature tags */}
              <div className="flex gap-1 mb-2.5 flex-wrap">
                {course.tags.map((tag) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[#f0f5fa] text-[#60788c]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Course start and comments */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectCourse(course.id)}
                  className="flex-1 h-9 rounded-full text-white text-[12px] transition-opacity active:opacity-80"
                  style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, backgroundColor: course.buttonColor }}
                >
                  코스 시작
                </button>
                <button
                  type="button"
                  onClick={() => setCommentsFor(course.id)}
                  aria-label={`${course.title} 댓글 보기`}
                  className="w-9 h-9 shrink-0 rounded-full bg-[#edf4fb] text-[#0570db] flex items-center justify-center active:opacity-70 transition-opacity"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M20 11.5a8 8 0 0 1-8 8 8.7 8.7 0 0 1-3.2-.6L4 20l1.1-4.1A8 8 0 1 1 20 11.5Z" />
                    <circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      <BottomNav active="courses" onTabChange={handleTabChange} />

      {/* Comments bottom sheet */}
      {commentsFor !== null && (() => {
        const data = courseComments[commentsFor] ?? { count: '아직 등록된 댓글이 없습니다.', comments: [] };
        return (
          <div
            className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setCommentsFor(null)}
          >
            <div
              className="relative bg-[#edf4fb] border-t border-[#dce3f1] rounded-tl-[32px] rounded-tr-[32px] pb-6 px-5 pt-6"
              style={{ boxShadow: '0px 25px 50px 0px rgba(0,0,0,0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title row */}
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-[16px] text-black">{getCourse(commentsFor)?.title}</p>
                <span className="text-[20px]">🏃</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-normal text-[12px] text-[#7b8796]">{data.count}</p>
                <p className="font-normal text-[12px] text-[#7b8796]">더보기 &gt;</p>
              </div>

              {/* Comment cards */}
              <div className="flex flex-col gap-3 mb-5">
                {data.comments.length === 0 && <p className="bg-white border border-[#dce3f1] rounded-[16px] px-4 py-4 text-[12px] text-[#7b8796]">아직 등록된 댓글이 없습니다.</p>}
                {data.comments.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#dce3f1] rounded-[16px] px-4 py-3 flex gap-3 items-start"
                    style={{ boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.1)' }}
                  >
                    <img src={avatarImg} alt="" className="w-[33px] h-[33px] rounded-full shrink-0" />
                    <div>
                      <p className="font-bold text-[12px] text-black mb-0.5">{c.user}</p>
                      {c.lines.map((line, j) => (
                        <p key={j} className="font-normal text-[12px] text-[#7b8796] leading-[19.5px]">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={() => setCommentsFor(null)}
                className="w-full h-[52px] rounded-[16px] bg-[#17213d] flex items-center justify-center"
              >
                <p className="font-bold text-[14px] text-white">닫기</p>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
