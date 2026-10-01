import { brandLogo } from '../lib/assets';
import { useState } from 'react';
import BottomNav, { type TabId } from '../components/BottomNav';

type Screen = 'login' | 'home' | 'courses' | 'course-detail';

interface Props {
  onNavigate: (screen: Screen) => void;
  onSelectCourse?: (id: number) => void;
}

const logo = brandLogo;
const mapImg = '/assets/dd208.svg';
const bookmarkIcon = '/assets/abf88.svg';

const filters = ['전체', '생활권', '관광', '공원', '반려견'];

interface Course {
  id: number;
  image: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  difficulty: string;
  difficultyColor: string;
  difficultyBg: string;
  rating: number;
  emoji: string;
  title: string;
  district: string;
  distance: string;
  duration: string;
  calories: string;
  tags: string[];
  buttonColor: string;
}

const courses: Course[] = [
  {
    id: 1,
    image: '/assets/c2574.png',
    category: '관광',
    categoryColor: '#60aedd',
    categoryBg: 'rgba(96,174,221,0.13)',
    difficulty: '보통',
    difficultyColor: '#f5a623',
    difficultyBg: 'rgba(245,166,35,0.13)',
    rating: 4.9,
    emoji: '🌊',
    title: '광안리 바다 갈매기런',
    district: '수영구',
    distance: '5.2km',
    duration: '38분',
    calories: '312kcal',
    tags: ['바다뷰', '포토스팟', '완주율 94%'],
    buttonColor: '#0570db',
  },
  {
    id: 2,
    image: '/assets/467dc.png',
    category: '관광',
    categoryColor: '#60aedd',
    categoryBg: 'rgba(96,174,221,0.13)',
    difficulty: '보통',
    difficultyColor: '#f5a623',
    difficultyBg: 'rgba(245,166,35,0.13)',
    rating: 4.9,
    emoji: '🌅',
    title: '해운대 해변 돌고래런',
    district: '해운대구',
    distance: '4.5km',
    duration: '30분',
    calories: '270kcal',
    tags: ['새벽 추천', '일출뷰', '포토스팟'],
    buttonColor: '#00c0e8',
  },
  {
    id: 3,
    image: '/assets/5d935.png',
    category: '공원',
    categoryColor: '#4caf7d',
    categoryBg: 'rgba(76,175,125,0.13)',
    difficulty: '쉬움',
    difficultyColor: '#4caf7d',
    difficultyBg: 'rgba(76,175,125,0.13)',
    rating: 4.8,
    emoji: '🌿',
    title: '낙동강 생태공원 오리런',
    district: '강서구',
    distance: '7.8km',
    duration: '55분',
    calories: '468kcal',
    tags: ['반려견 OK', '평탄', '생태경관'],
    buttonColor: '#4caf7d',
  },
  {
    id: 4,
    image: '/assets/4421c.png',
    category: '생활권',
    categoryColor: '#7b5ea7',
    categoryBg: 'rgba(123,94,167,0.13)',
    difficulty: '쉬움',
    difficultyColor: '#4caf7d',
    difficultyBg: 'rgba(76,175,125,0.13)',
    rating: 4.7,
    emoji: '🏙️',
    title: '서면 생활권 하트런',
    district: '부산진구',
    distance: '3.6km',
    duration: '24분',
    calories: '216kcal',
    tags: ['출퇴근', '상권연계', '야간 OK'],
    buttonColor: '#7b5ea7',
  },
  {
    id: 5,
    image: '/assets/3f40a.png',
    category: '반려견',
    categoryColor: '#e07b39',
    categoryBg: 'rgba(224,123,57,0.13)',
    difficulty: '쉬움',
    difficultyColor: '#4caf7d',
    difficultyBg: 'rgba(76,175,125,0.13)',
    rating: 4.6,
    emoji: '🐾',
    title: '을숙도 반려견 산책런',
    district: '사하구',
    distance: '4.2km',
    duration: '35분',
    calories: '252kcal',
    tags: ['반려견 필수', '잔디밭', '분수공원'],
    buttonColor: '#e07b39',
  },
];

const avatarImg = '/assets/ad867.svg';

interface Comment {
  user: string;
  lines: string[];
}

interface CourseComments {
  title: string;
  count: string;
  comments: Comment[];
}

const courseComments: Record<number, CourseComments> = {
  1: {
    title: '광안리 바다 갈매기런',
    count: '138명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['광안대교를 향해 뛰어가다 보면 너무 상쾌하고 좋아요~', '중심지와는 달라서 뛰기 좋네요!'] },
      { user: 'User 2', lines: ['광안리 여행 버킷리스트가 러닝이었는데, 꿈 같은 시간이었어요... 추천합니다!'] },
      { user: 'User 3', lines: ['평지라 뛰기 좋음 ㅋㅋㅋ'] },
    ],
  },
  2: {
    title: '해운대 해변 돌고래런',
    count: '61명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['해운대 모래사장 라인을 따라 뛰어서 넓고 좋아요!', '전 바다는 해운대가 짱이라 생각...ㅎㅎ'] },
      { user: 'User 2', lines: ['낮에 뛰면 그늘이 없어서 좀 힘듦... 다들 오후에 뛰시길'] },
      { user: 'User 3', lines: ['내 최애 코스!!!!!!!!! 이거 안 뛰어본 사람은 허수야', '이 코스가 경치도 좋고 거리도 딱 적당하고 아주 좋음♥'] },
    ],
  },
  3: {
    title: '낙동강 생태공원 오리런',
    count: '47명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['서울에 한강이 있다면 부산은 낙동강이 있다!', '언젠가 러너들의 성지가 되리라 믿습니다 ㅋㅋ'] },
      { user: 'User 2', lines: ['집에서 낙동강이 좀 멀어서 별로 안 가봤었는데, 순위 높길래', '오늘 뛰고 왔네요~ 겨울엔 진짜 오리도 있어서 귀여워요.'] },
      { user: 'User 3', lines: ['여러분... 노을이 찐입니다. 해질 때쯤 가서 뛰어보세요!!', '오늘 좀 힘든 하루였는데 힐링했어요 ㅠㅠ'] },
    ],
  },
  4: {
    title: '서면 생활권 하트런',
    count: '203명이 이 코스로 뛰었어요!',
    comments: [
      { user: 'User 1', lines: ['썸타는 사람이랑 하트런으로 러닝 데이트 했다가 오늘 1일 됐습니다. 기 받아가세요 ㅎㅎ'] },
      { user: 'User 2', lines: ['서면에 이런 길이 있는 줄 몰랐다 ㄷㄷ 맨날 러닝할 곳 없어서', '헬스장 갔는데 나이스!!'] },
      { user: 'User 3', lines: ['저희 집 앞부터 시작되는 코스길래 궁금해서 해봤어요.', '앞으로 종종 이렇게 뛸 듯요!'] },
    ],
  },
  5: {
    title: '을숙도 반려견 산책런',
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

  const handleTabChange = (tab: TabId) => {
    if (tab === 'courses') return;
    if (tab === 'home') onNavigate('home');
    if (tab === 'records') onNavigate('records' as Parameters<typeof onNavigate>[0]);
    if (tab === 'benefits') onNavigate('benefits' as Parameters<typeof onNavigate>[0]);
    if (tab === 'esg') onNavigate('esg' as Parameters<typeof onNavigate>[0]);
  };

  const filteredCourses = activeFilter === '전체'
    ? courses
    : courses.filter(c => c.category === activeFilter || (activeFilter === '공원' && c.category === '공원'));

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

      {/* Subtitle */}
      <p className="px-4 text-[12px] text-[#b4b4b4] mb-3" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
        AI가 제공하는 나만의 코스를 경험할 수 있어요
      </p>

      {/* Map Preview */}
      <div className="mx-4 mb-3 rounded-[20px] overflow-hidden bg-[#dde8f2] relative h-[200px] flex-shrink-0">
        <img src={mapImg} alt="map" className="absolute inset-0 w-full h-full object-cover" />
        {/* Route labels */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-3 py-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#60aedd]" />
            <span className="text-[10px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>강서구청 루프 4.6km</span>
          </div>
          <div className="backdrop-blur-sm bg-white/80 border border-black/10 rounded-full px-3 py-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6acf98]" />
            <span className="text-[10px] text-[#6acf98]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>대저 생태런 6.8km</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 flex gap-2 px-4 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
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
      <div className="flex-1 overflow-y-auto pb-[72px] px-4 flex flex-col gap-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-[#dce3f1] rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Course image */}
            <div className="relative h-[130px]">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
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
                <span className="text-[10px] text-[#ffb800] leading-none">★</span>
                <span className="text-[10px] text-[#3d4a5c]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{course.rating}</span>
                <span className="ml-auto text-[10px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>📍 {course.district}</span>
              </div>

              {/* Title */}
              <h3 className="text-[14px] text-[#1a2535] mb-2" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>
                {course.title}
              </h3>

              {/* Stats row */}
              <div className="flex gap-0 mb-2 bg-[#f5f8fc] rounded-xl overflow-hidden">
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{course.distance}</p>
                  <p className="text-[9px] text-[#9baab8]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>거리</p>
                </div>
                <div className="w-px bg-[#dce3f1]" />
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{course.duration}</p>
                  <p className="text-[9px] text-[#9baab8]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>시간</p>
                </div>
                <div className="w-px bg-[#dce3f1]" />
                <div className="flex-1 text-center py-2">
                  <p className="text-[13px] text-[#1a2535]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>{course.calories}</p>
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

              {/* CTA + avatars */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectCourse ? onSelectCourse(course.id) : onNavigate('course-detail')}
                  className="flex-1 h-9 rounded-full text-white text-[12px] transition-opacity active:opacity-80"
                  style={{ fontFamily: 'Noto Sans KR', fontWeight: 900, backgroundColor: course.buttonColor }}
                >
                  코스 시작
                </button>
                {/* Stacked avatar circles */}
                <button
                  onClick={() => setCommentsFor(course.id)}
                  className="flex items-center active:opacity-70 transition-opacity"
                >
                  <div className="w-6 h-6 rounded-full bg-[#c8dff5] border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-[#d5eedd] border-2 border-white -ml-1.5" />
                  <div className="w-6 h-6 rounded-full bg-[#f5ddc8] border-2 border-white -ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="courses" onTabChange={handleTabChange} />

      {/* Comments bottom sheet */}
      {commentsFor !== null && (() => {
        const data = courseComments[commentsFor];
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
                <p className="font-bold text-[16px] text-black">{data.title}</p>
                <span className="text-[20px]">🏃</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-normal text-[12px] text-[#7b8796]">{data.count}</p>
                <p className="font-normal text-[12px] text-[#7b8796]">더보기 &gt;</p>
              </div>

              {/* Comment cards */}
              <div className="flex flex-col gap-3 mb-5">
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
