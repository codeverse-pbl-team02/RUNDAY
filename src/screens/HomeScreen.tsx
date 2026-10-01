import { brandLogo } from '../lib/assets';
import { useState } from 'react';
import { LocationCard } from '../running/RunScreens';
import { useAuth } from '../auth/AuthProvider';
import { authError } from '../auth/errors';
import BottomNav, { type TabId } from '../components/BottomNav';

import type { Screen } from '../App';
import CollapsibleMenuSection from '../components/CollapsibleMenuSection';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const logo = brandLogo;
const graphImg = '/assets/0636c.svg';
const arrowImg = '/assets/3d2d4.svg';
const courseImg = '/assets/c2574.png';
const product1 = '/assets/ff01f.png';
const product2 = '/assets/9909d.png';
const product3 = '/assets/56120.png';

const menuSections = [
  {
    title: '내 계정',
    items: [
      { icon: '👤', label: '프로필 관리', sub: '닉네임·사진·개인정보 수정', screen: 'profile' },
      { icon: '📄', label: '마이 페이지', sub: '내 활동 요약 및 통계', screen: '' },
    ],
  },
  {
    title: '러닝 & 기록',
    items: [
      { icon: '🏃', label: '기록 관리', sub: '러닝 타임라인 및 분석', screen: 'records' },
      { icon: '🗺️', label: '코스 탐색', sub: '추천 코스 찾기', screen: 'courses' },
      { icon: '🏅', label: '나의 배지', sub: '획득 배지 및 목표 확인', screen: 'my-badges' },
      { icon: '🏆', label: '랭킹', sub: '월간 누적 거리 랭킹', screen: 'ranking-full' },
    ],
  },
  {
    title: 'ESG & 혜택',
    items: [
      { icon: '♻️', label: 'ESG 챌린지', sub: '플로깅·반려견 챌린지', screen: 'esg' },
      { icon: '🎁', label: '혜택 & 쿠폰', sub: '포인트·할인 쿠폰 확인', screen: 'benefits' },
    ],
  },
  {
    title: '설정',
    items: [
      { icon: '🔔', label: '알림 설정', sub: '푸시 알림 관리', screen: '' },
      { icon: '⚙️', label: '앱 설정', sub: '테마·언어·접근성', screen: '' },
      { icon: '🔒', label: '개인정보 처리방침', sub: '', screen: '' },
    ],
  },
];

export default function HomeScreen({ onNavigate }: Props) {
  const { user, profile, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabChange = (tab: TabId) => {
    if (tab === 'home') return;
    if (tab === 'courses') onNavigate('courses');
    if (tab === 'records') onNavigate('records' as Parameters<typeof onNavigate>[0]);
    if (tab === 'benefits') onNavigate('benefits' as Parameters<typeof onNavigate>[0]);
    if (tab === 'esg') onNavigate('esg' as Parameters<typeof onNavigate>[0]);
  };

  const handleMenuNav = (screen?: string) => {
    setMenuOpen(false);
    if (screen) onNavigate(screen as Parameters<typeof onNavigate>[0]);
  };

  return (
    <div className="flex flex-col h-full bg-[#edf4fb] relative">
      {/* Slide-in drawer overlay */}
      {menuOpen && (
        <div
          className="absolute inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Drawer panel */}
          <div
            className="relative w-[300px] bg-white flex flex-col"
            style={{ height: 800, boxShadow: '4px 0 24px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header / profile — fixed */}
            <div
              className="flex-shrink-0 px-5 pt-6 pb-4 flex flex-col gap-2"
              style={{ background: 'linear-gradient(160deg, #0570db 0%, #60aedd 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="w-[40px] h-[40px] rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-[22px]">
                  🐕
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="size-7 flex items-center justify-center rounded-full bg-white/20"
                >
                  <span className="text-white text-[15px] leading-none">✕</span>
                </button>
              </div>
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="font-bold text-[14px] text-white">{profile?.displayName || '러너'} 님</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{user?.email}</p>
                </div>
                <button
                  disabled={loggingOut}
                  onClick={async () => {
                    setLoggingOut(true); setLogoutError('');
                    try { await logout(); } catch (error) { setLogoutError(authError(error)); }
                    finally { setLoggingOut(false); }
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#e05c5c] border border-[#c94040]"
                >
                  <p className="font-bold text-[11px] text-white">로그아웃</p>
                </button>
              </div>
              <div className="flex gap-2">
                {[
                  { val: '124.6km', label: '누적 거리' },
                  { val: '38회', label: '러닝 횟수' },
                  { val: '10개', label: '배지' },
                ].map((s) => (
                  <div key={s.label} className="flex-1 bg-white/15 rounded-[10px] py-1.5 flex flex-col items-center">
                    <p className="font-bold text-[12px] text-white">{s.val}</p>
                    <p className="text-[9px] text-white/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {logoutError && <p role="alert" className="px-4 pt-2 text-[12px] text-red-600">{logoutError}</p>}
            {/* Menu sections — scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {menuSections.map((section) => (
                <CollapsibleMenuSection key={section.title} title={section.title}>
                  <div className="bg-[#f5f8fc] rounded-[16px] overflow-hidden">
                    {section.items.map((item, i) => (
                      <button
                        key={item.label}
                        onClick={() => handleMenuNav(item.screen)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[#e8f0fb] transition-colors ${i > 0 ? 'border-t border-[#e8edf5]' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-[16px]">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-[#1a2535]">{item.label}</p>
                          {item.sub && <p className="text-[10px] text-[#94afc8] mt-0.5 truncate">{item.sub}</p>}
                        </div>
                        <span className="text-[#c8d8e8] text-[14px]">›</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleMenuSection>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 flex items-center h-[56px] px-3">
        <button
          onClick={() => setMenuOpen(true)}
          className="size-6 flex items-center justify-center shrink-0"
        >
          <img src="/assets/1c228.svg" alt="menu" className="w-[18px] h-[18px] object-contain" />
        </button>
        <div className="flex-1 flex justify-center">
          <img src={logo} alt="뛴데이" className="h-9 object-contain" />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="notifications" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[72px]">
        {/* Greeting */}
        <div className="px-4 pt-2 pb-3">
          <p className="text-[18px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>
            안녕하세요, {profile?.displayName || '러너'}님! 👋
          </p>
          <p className="text-[12px] text-[#b4b4b4] mt-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
            나만의 추천 러닝 코스를 경험해보세요.
          </p>
        </div>

        <LocationCard />
        {/* AI prompt bar */}
        <div className="px-4 mb-4">
          <div className="bg-white border border-[#dce3f1] rounded-3xl h-[37px] flex items-center px-4 gap-2">
            <span className="text-[20px] leading-none opacity-50">🏃</span>
            <span className="text-[13px] text-[#b4b4b4] flex-1" style={{ fontFamily: 'Noto Sans KR', fontWeight: 500 }}>
              퇴근 후에 30분 동안 러닝 뛸 만한 코스 추천해줘.
            </span>
          </div>
        </div>

        {/* Today's recommended course */}
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[14px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>오늘의 추천 코스</p>
              <p className="text-[12px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>내 위치를 기준으로 코스를 빠르고 쉽게!</p>
            </div>
            <button className="text-[10px] text-[#0570db]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 500 }}>View All</button>
          </div>

          <div className="flex gap-3">
            {/* Today's course card */}
            <div className="bg-gradient-to-r from-[#fff4d6] via-[#fff9e6] to-[#fffdf5] border border-[#dce3f1] rounded-3xl p-3 flex-1 shadow-sm">
              <p className="text-[9px] text-[#7b8796] mb-1" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>오늘의 러닝</p>
              <p className="text-[11px] text-black leading-tight" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>
                광안리 바다<br />갈매기런
              </p>
              <button
                onClick={() => onNavigate('course-detail')}
                className="mt-2 bg-[#4cb57d] border border-[#4cb57d] text-white text-[11px] rounded-3xl px-3 py-1"
                style={{ fontFamily: 'Noto Sans KR', fontWeight: 500 }}
              >
                Start
              </button>
            </div>

            {/* Nearby landmarks card */}
            <div className="bg-[#fffdf5] border border-[#dce3f1] rounded-3xl p-3 flex-1 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-1.5">
                  <div className="w-5 h-4 border border-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px]">📍</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-black leading-tight" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>낙동강 하구 철새 도래지</p>
                    <p className="text-[9px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>예시 장소 · 이동 시간 미계산</p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="w-5 h-4 border border-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px]">📍</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-black leading-tight" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>신호 생태 공원</p>
                    <p className="text-[9px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>예시 장소 · 이동 시간 미계산</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free running button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => onNavigate('running')}
            className="w-full h-[47px] bg-[#0570db] rounded-3xl text-white text-[14px] font-bold"
            style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}
          >
            자유 러닝 시작하기
          </button>
        </div>

        {/* Weekly running chart */}
        <div className="px-4 mb-3">
          <p className="text-[14px] text-black mb-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>이번 주 러닝 기록 (예시)</p>
          <p className="text-[12px] text-[#7b8796] mb-2" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>탄소 절감량과 함께보는 7일 러닝 기록!</p>

          <div className="bg-white border border-[#dce3f1] rounded-3xl p-4">
            <div className="flex justify-end mb-2">
              <span className="text-[10px] text-[#0570db]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 500 }}>총 31.3km</span>
            </div>
            {/* Chart */}
            <div className="relative h-9 mb-2">
              <img src={graphImg} alt="weekly chart" className="w-full h-full object-fill" />
            </div>
            {/* Day labels */}
            <div className="flex justify-between text-[10px] text-black border-t border-[#dce3f1] pt-2 mb-3">
              {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                <span key={d} style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>{d}</span>
              ))}
            </div>
            {/* Carbon savings */}
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🌍</span>
              <div>
                <p className="text-[11px] text-[#4cb57d]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 900 }}>오늘의 탄소 절감</p>
                <p className="text-[12px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>
                  4.2km 달려{' '}
                  <span className="text-[#4cb57d]">0.9kg CO₂</span>
                  {' '}절감
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 mb-3">
          <div className="bg-white border border-[#dce3f1] rounded-3xl p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '⏱️', label: '기록 확인', action: () => onNavigate('records') },
                { icon: '🗺️', label: '코스 탐색', action: () => onNavigate('courses') },
                { icon: '🛒', label: '쇼핑하기' },
                { icon: '🐕', label: '반려견 인증', action: () => onNavigate('dog-verify') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-[62px] h-[62px] bg-white border border-[#dce3f1] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <span className="text-[12px] text-black" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product promotion */}
        <div className="px-4 mb-4">
          <p className="text-[14px] text-black mb-0.5" style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>템빨로 능력치 끌어올리기!</p>
          <p className="text-[12px] text-[#7b8796] mb-2" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>
            이 활동은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 h-[63px] rounded-3xl overflow-hidden">
              <img src={product1} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-[63px] rounded-3xl overflow-hidden">
              <img src={product2} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-[63px] overflow-hidden">
              <img src={product3} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" onTabChange={handleTabChange} />
    </div>
  );
}
