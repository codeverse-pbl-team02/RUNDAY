import AppPageHeader from '../components/AppPageHeader';
import BottomNav from '../components/BottomNav';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useActivity } from '../running/ActivityProvider';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const BADGE_FILTERS = ['전체', '거리', '연속', '코스', '이벤트'];

const BADGES = [
  { emoji: '👟', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: '베이비 러너', desc: '첫 1km 완주', date: '1월 15일', unlocked: true, isNew: false },
  { emoji: '🌟', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: '10km 달성', desc: '누적 10km 돌파', date: '2월 3일', unlocked: true, isNew: false },
  { emoji: '💪', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', name: '50km 돌파', desc: '누적 50km 완주', date: '3월 20일', unlocked: true, isNew: false },
  { emoji: '🔥', gradient: 'linear-gradient(135deg, #fd7f6f 0%, #fddb92 100%)', name: '100km 달성', desc: '누적 100km 완주', date: '6월 1일', unlocked: true, isNew: true },
  { emoji: '⚡', gradient: null, name: '200km 목표', desc: '누적 200km 달성', progress: 71, current: 142.8, goal: 200, unlocked: false, isNew: false },
  { emoji: '🏆', gradient: null, name: '500km 전설', desc: '누적 500km 완주', progress: 29, current: 142.8, goal: 500, unlocked: false, isNew: false },
  { emoji: '🌱', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', name: '7일 연속', desc: '7일 연속 운동', date: '1월 22일', unlocked: true, isNew: false },
  { emoji: '🌿', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', name: '14일 연속', desc: '2주 연속 운동', date: '2월 5일', unlocked: true, isNew: false },
  { emoji: '🌳', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: '21일 연속', desc: '3주 연속 운동', date: '7월 4일', unlocked: true, isNew: true },
  { emoji: '🏅', gradient: null, name: '30일 연속', desc: '한 달 연속 운동', progress: 80, current: 24, goal: 30, unit: '일', unlocked: false, isNew: false },
  { emoji: '💎', gradient: null, name: '100일 연속', desc: '100일 연속 운동', progress: 24, current: 24, goal: 100, unit: '일', unlocked: false, isNew: false },
];

export default function MyBadgesScreen({ onNavigate }: Props) {
  const { profile, user } = useAuth();
  const nickname = profile?.displayName || user?.displayName || '러너';
  const { totalDistanceMeters, longestStreak, badgeCount } = useActivity();
  const freshAccount = profile?.dataVersion === 2;
  const distanceKm = totalDistanceMeters / 1000;
  const [activeFilter, setActiveFilter] = useState('전체');

  return (
    <div className="relative flex flex-col h-full bg-[#edf4fb]">
      <AppPageHeader onBack={() => onNavigate('home')} />
      <div className="px-5 pb-4 shrink-0">
        <p className="flex min-w-0 whitespace-nowrap text-[14px] font-bold leading-6 text-black" title={`열심히 달려온 ${nickname}님의 ${freshAccount ? '배지를 모아볼까요?' : '기록을 분석해볼까요?'}`}>
          <span className="shrink-0">열심히 달려온&nbsp;</span><span className="min-w-0 truncate">{nickname}</span><span className="shrink-0">님의 {freshAccount ? '배지를 모아볼까요?' : '기록을 분석해볼까요?'}</span>
        </p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[76px]">
        {/* Stats summary card */}
        <div className="mx-4 bg-white border border-[#dce3f1] rounded-[24px] px-5 py-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#94afc8]">획득한 배지</p>
              <div className="flex items-baseline gap-1">
                <p className="font-black text-[30px] text-[#0d1b2e] leading-none">{freshAccount ? badgeCount : 10}</p>
                <p className="text-[14px] text-[#94afc8]">/ {freshAccount ? BADGES.length : 18}개</p>
              </div>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-[16px]"
              style={{ background: '#d4eee3' }}
            >
              <span className="text-[24px] leading-none mb-1">🌳</span>
              <p className="font-bold text-[10px] text-[#2f6853]">{freshAccount ? `획득 ${badgeCount}개` : '이번 달 +2개'}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-[8px] bg-[#d6e9f8] rounded-full overflow-hidden">
              <div className="h-full bg-[#8bc6e4] rounded-full" style={{ width: freshAccount ? `${Math.round(badgeCount / BADGES.length * 100)}%` : '59%' }} />
            </div>
            <p className="font-bold text-[11px] text-[#0570db]">{freshAccount ? `${Math.round(badgeCount / BADGES.length * 100)}%` : '59%'}</p>
          </div>

          {/* Bottom stats */}
          <div className="border-t border-[#d6e9f8] pt-3 flex">
            {[
              { icon: '🔥', label: '배지 획득률', val: freshAccount ? `${Math.round(badgeCount / BADGES.length * 100)}%` : '상위 20%' },
              { icon: '🏃', label: '배지 타입', val: freshAccount ? badgeCount ? '러너' : '없음' : '새벽러너' },
              { icon: '⭐', label: '희귀 배지', val: freshAccount ? '0개' : '2개' },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex-1 flex flex-col items-center"
                style={{ borderRight: i < 2 ? '0.8px solid #d6e9f8' : undefined }}
              >
                <span className="text-[16px] mb-0.5">{s.icon}</span>
                <p className="text-[9px] text-[#94afc8]">{s.label}</p>
                <p className="font-bold text-[12px] text-[#0d1b2e]">{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-[7px] px-4 pb-3 overflow-x-auto">
          {BADGE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center justify-center px-[14px] py-[6px] rounded-full shrink-0 border text-[11px] font-bold whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-[#bde3f6] border-[#bde3f6] text-[#285b78]'
                  : 'bg-white border-[#d6e9f8] text-[#4a6080]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {BADGES.map((original, index) => {
            const goal = [1, 10, 50, 100, 200, 500, 7, 14, 21, 30, 100][index];
            const current = index < 6 ? distanceKm : longestStreak;
            const badge = freshAccount ? {
              ...original, unlocked: current >= goal, isNew: false,
              date: current >= goal ? '달성' : undefined,
              current: index < 6 ? Number(current.toFixed(1)) : current,
              goal, unit: index < 6 ? ' km' : '일',
              progress: Math.min(100, Math.floor(current / goal * 100)),
            } : original;
            return (
            <div
              key={badge.name}
              className="bg-white rounded-[24px] p-4 flex flex-col items-center relative overflow-hidden"
              style={{
                border: badge.isNew ? '1px solid #c0e2d2' : '1px solid #dce3f1',
                opacity: badge.unlocked ? 1 : 0.75,
                boxShadow: badge.unlocked ? '0px 2px 8px rgba(5,112,219,0.07)' : 'none',
              }}
            >
              {badge.isNew && (
                <div className="absolute top-2.5 right-2.5 bg-[#d4eee3] rounded-full px-1.5 py-0.5">
                  <p className="font-bold text-[9px] text-[#2f6853]">NEW</p>
                </div>
              )}
              <div
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center mb-2"
                style={{ background: badge.unlocked ? ['#e1f1fa', '#fff0d9', '#e5eafa', '#fbe5de', '#e1f1fa', '#fff0d9', '#e1f1e7', '#e1f1fa', '#e1f1e7'][index] ?? '#e1f1fa' : '#f0f3f6' }}
              >
                <span className="text-[24px]">{badge.emoji}</span>
              </div>
              <p className={`font-bold text-[12px] text-center mb-1 ${badge.unlocked ? 'text-[#0d1b2e]' : 'text-[#94afc8]'}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-[#94afc8] text-center mb-2">{badge.desc}</p>
              {badge.unlocked ? (
                <div className="bg-[#d6e9f8] flex gap-1 items-center px-2 py-0.5 rounded-full">
                  <span className="font-bold text-[10px] text-[#0570db]">✓</span>
                  <span className="font-bold text-[10px] text-[#0570db]">{badge.date}</span>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                  <p className="text-[9px] text-[#94afc8]">{badge.current} / {badge.goal}{badge.unit ?? ' km'}</p>
                    <p className="font-bold text-[9px] text-[#0570db]">{badge.progress}%</p>
                  </div>
                  <div className="h-[6px] bg-[#e8edf2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8bc6e4] rounded-full" style={{ width: `${badge.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ); })}
        </div>
      </div>
      <BottomNav active="records" onTabChange={tab => onNavigate(tab)} />
    </div>
  );
}
