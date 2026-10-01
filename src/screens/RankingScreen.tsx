import { brandLogo } from '../lib/assets';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const TOP3 = [
  { rank: 2, emoji: '🐰', name: '해운대페메', km: '128.5', streak: '연속 21일', badge: '👑 2위', isFirst: false },
  { rank: 1, emoji: '🐱', name: '러닝왕강지훈', km: '142.8', streak: '월간 MVP', badge: '👑 1위', isFirst: true },
  { rank: 3, emoji: '🐻', name: '매일뛰다보면', km: '115.2', streak: '연속 14일', badge: '👑 3위', isFirst: false },
];

const LIST = [
  { rank: 4, tier: '마라토너', emoji: '🐤', name: '페가수스', km: '98.4' },
  { rank: 5, tier: '스프린터', emoji: '⚡', name: '광안리 번개', km: '88.2' },
  { rank: 6, tier: '열정러너', emoji: '🐊', name: '다정한악어', km: '79.5' },
  { rank: 7, tier: '꾸준러너', emoji: '🐵', name: '기운찬초보', km: '72.1' },
  { rank: 8, tier: '산책마스터', emoji: '🐸', name: '폭풍질주', km: '65.4' },
  { rank: 9, tier: '새벽러너', emoji: '🐱', name: '깔끔한고양이', km: '58.0' },
];

export default function RankingScreen({ onNavigate }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#edf4fb]">
      {/* Header */}
      <div className="bg-[#edf4fb] flex h-[56px] items-center px-3 shrink-0 w-full">
        <img src={brandLogo} alt="뛴데이" className="h-[48px] w-[112px] object-contain" />
        <div className="flex-1" />
        <button className="size-[20px] overflow-clip relative shrink-0">
          <img src="/assets/1c57a.svg" alt="" className="absolute inset-0 size-full" />
        </button>
      </div>

      {/* Back + title */}
      <div className="flex items-center px-2 pb-2 pt-1 shrink-0">
        <button onClick={() => onNavigate('home')} className="size-6 flex items-center justify-center mr-1">
          <img src="/assets/3b466.svg" alt="back" className="size-full" />
        </button>
      </div>
      <div className="px-5 pb-4 shrink-0">
        <p className="font-bold text-[14px] text-black leading-6">열심히 달려온</p>
        <p className="font-bold text-[14px] text-black leading-6">부기 님의 기록을 분석해볼까요?</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Stats summary card */}
        <div className="mx-4 bg-white rounded-[24px] px-5 py-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-[16px] text-black">7월 누적 기록</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <p className="text-[11px] text-[#4a6080]">
                이달의 러닝 <span className="text-[#f97316]">🔥 24일간 연속 운동 중</span>
              </p>
              <div className="relative h-[33px] my-2">
                <p className="absolute font-extrabold text-[32px] text-[#0d1b2e] leading-none left-0 top-0"
                  style={{ fontFamily: 'Outfit' }}>124.6</p>
                <p className="absolute text-[14px] text-[#94afc8] leading-none"
                  style={{ fontFamily: 'Outfit', left: 82, top: 13 }}>km</p>
              </div>
              <div className="bg-[#d6e9f8] inline-flex items-center px-2.5 py-0.5 rounded-full">
                <p className="text-[11px] text-[#0570db]">📈 월간 목표 83% 달성</p>
              </div>
            </div>
            {/* Donut placeholder */}
            <div className="relative w-[104px] h-[104px] shrink-0">
              <img src="/assets/5d5f9.svg" alt="" className="absolute inset-0 size-full" />
              <img src="/assets/315f1.svg" alt="" className="absolute w-[67.6px] h-[83px]" style={{ left: 26, top: 9.35 }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-bold text-[11px] text-[#0d1b2e]">전체</p>
                <p className="font-bold text-[20px] text-[#0d1b2e] leading-none">124.6</p>
                <p className="text-[9px] text-[#94afc8]">/ 150 km</p>
              </div>
            </div>
          </div>
          {/* Mini stat pills */}
          <div className="flex gap-2 mt-4">
            {[
              { icon: '📍', label: '총 누적거리', val: '124.6', unit: 'km' },
              { icon: '🏃', label: '러닝 횟수', val: '38', unit: '회' },
              { icon: '🔥', label: '소모 칼로리', val: '8,420', unit: 'kcal' },
            ].map((s) => (
              <div key={s.label} className="flex-1 border border-black rounded-[16px] px-1.5 py-2">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <span className="text-[10px]">{s.icon}</span>
                  <p className="font-bold text-[10px] text-black">{s.label}</p>
                </div>
                <p className="font-bold text-[12px] text-black text-center">
                  {s.val}<span className="font-normal text-[9px] text-[#94afc8] ml-0.5">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="font-bold text-[14px] text-[#7b8796]">월간 누적 거리 랭킹</p>
          <button>
            <p className="text-[12px] text-[#60aedd]">챌린지 규칙</p>
          </button>
        </div>

        {/* Podium */}
        <div className="flex gap-2 items-end justify-center px-4 mb-4" style={{ height: 215 }}>
          {TOP3.map((p) => (
            <div key={p.rank} className="flex-1 flex flex-col items-center">
              {/* Badge label */}
              <div
                className="rounded-full px-2 py-0.5 mb-1"
                style={{ background: p.isFirst ? '#000' : '#f8f9fa', boxShadow: '0px 1px 1px rgba(0,0,0,0.1)' }}
              >
                <p className={`font-black text-[10px] ${p.isFirst ? 'text-white' : 'text-black'}`}>{p.badge}</p>
              </div>
              {/* Card */}
              <div
                className="w-full flex flex-col gap-1 items-center justify-center rounded-[24px]"
                style={{
                  height: p.isFirst ? 176 : 160,
                  background: '#fff',
                  border: p.isFirst ? '1.6px solid black' : '0.8px solid black',
                  boxShadow: p.isFirst
                    ? '0px 2px 2px rgba(0,0,0,0.1), 0px 4px 3px rgba(0,0,0,0.1)'
                    : '0px 1px 1px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: p.isFirst ? 64 : 56,
                    height: p.isFirst ? 64 : 56,
                    background: '#f9fafb',
                    border: p.isFirst ? '1.6px solid black' : undefined,
                  }}
                >
                  <span style={{ fontSize: p.isFirst ? 36 : 30 }}>{p.emoji}</span>
                </div>
                <p className="font-bold text-[12px] text-black text-center px-1">{p.name}</p>
                <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>
                  {p.km}<span className="font-normal text-[11px] text-[#7b8796] ml-0.5">km</span>
                </p>
                <div className="bg-[#f8f9fa] rounded-full px-2 py-0.5" style={{ boxShadow: '0px 1px 0.5px rgba(0,0,0,0.05)' }}>
                  <p className="font-bold text-[10px] text-black">{p.streak}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rank list 4+ */}
        <div className="px-4 flex flex-col gap-2 mb-4">
          {LIST.map((item) => (
            <div
              key={item.rank}
              className="bg-white border border-black rounded-[24px] flex gap-3 items-center px-4 py-3"
              style={{ boxShadow: '0px 1px 1px rgba(0,0,0,0.05)' }}
            >
              <div className="flex flex-col items-center w-8 shrink-0">
                <p className="font-bold text-[14px] text-black" style={{ fontFamily: 'Consolas, monospace' }}>{item.rank}</p>
                <div className="bg-[#f8f9fa] rounded-full px-1.5 py-0.5">
                  <p className="text-[9px] text-[#7b8796] font-semibold">{item.tier}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#f9fafb] flex items-center justify-center shrink-0">
                <span className="text-[20px]">{item.emoji}</span>
              </div>
              <p className="font-bold text-[14px] text-black flex-1">{item.name}</p>
              <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>
                {item.km} km
              </p>
            </div>
          ))}
        </div>

        {/* My rank sticky card */}
        <div className="mx-4 bg-white/0 border-[1.6px] border-black rounded-[24px] flex gap-3 items-center px-4 py-3"
          style={{ boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>
          <div className="flex flex-col items-center w-8 shrink-0">
            <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>24</p>
            <div className="bg-[#60aedd] rounded-full px-1.5 py-0.5">
              <p className="font-bold text-[9px] text-white">내 순위</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center shrink-0">
            <span className="text-[20px]">🐕</span>
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-[14px] text-[#60aedd]">야르렁</p>
            <p className="text-[10px] text-[#7b8796]">서면 생활권 · 연속 5일</p>
          </div>
          <p className="font-bold text-[16px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>42.5 km</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-4 mt-4">
          <button className="flex-1 h-[48px] bg-white rounded-[24px] flex items-center justify-center"
            style={{ boxShadow: '0px 1px 1.5px rgba(0,0,0,0.12)' }}>
            <p className="font-bold text-[14px] text-black">공유하기</p>
          </button>
          <button className="flex-1 h-[48px] bg-white rounded-[24px] flex items-center justify-center"
            style={{ boxShadow: '0px 2px 3px rgba(0,0,0,0.12)' }}>
            <p className="font-bold text-[14px] text-black">1위 코스 따라뛰기</p>
          </button>
        </div>
      </div>
    </div>
  );
}
