import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../App';

type SubTab = 'records' | 'badges' | 'rankings';

interface Props {
  onNavigate: (screen: Screen) => void;
}

function SharedHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="bg-[#edf4fb] flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
        <button onClick={onBack} className="size-6 flex items-center justify-center shrink-0">
          <img src="/assets/c4f3a.svg" alt="back" className="size-full" />
        </button>
        <div className="flex-1 flex justify-center">
          <img alt="" className="h-9 object-contain" src="/assets/9065b.png" />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>
      <div className="flex flex-col items-start pb-4 px-5 shrink-0 w-full">
        <div className="font-bold text-black text-[18px] leading-[0]">
          <p className="leading-[28px] mb-0">열심히 달려온</p>
          <p className="leading-[28px]">부기 님의 기록을 분석해볼까요?</p>
        </div>
      </div>
    </>
  );
}

function StatsCard() {
  return (
    <div className="px-4 shrink-0 w-full">
      <div className="bg-white flex flex-col items-start px-5 py-4 rounded-[24px] w-full">
        <p className="font-bold text-[14px] text-black leading-6">7월 누적 기록</p>
        <div className="flex gap-3 h-[116px] items-start pt-3 w-full">
          <div className="flex flex-1 flex-col items-start">
            <p className="text-[#4a6080] text-[11px] font-normal leading-[16.5px]">
              이달의 러닝 <span className="text-[#f97316]">🔥 24일간 연속 운동 중</span>
            </p>
            <div className="flex items-end gap-1 my-2">
              <p className="font-extrabold leading-[32px] text-[#0d1b2e] text-[32px]" style={{ fontFamily: 'Noto Sans KR' }}>124.6</p>
              <p className="font-normal leading-[20px] text-[#94afc8] text-[14px] pb-[4px]" style={{ fontFamily: 'Noto Sans KR' }}>km</p>
            </div>
            <div className="bg-[#d6e9f8] flex h-[20.5px] items-center px-[10px] py-[2px] rounded-full">
              <p className="font-normal text-[#0570db] text-[11px] leading-[16.5px] whitespace-nowrap" style={{ fontFamily: 'Noto Sans KR' }}>📈 월간 목표 83% 달성</p>
            </div>
          </div>
          <div className="relative shrink-0 size-[104px]">
            <img alt="" className="absolute inset-0 size-full" src="/assets/5d5f9.svg" />
            <div className="absolute left-[26px] top-[9px] h-[83px] w-[68px]">
              <img alt="" className="absolute inset-0 size-full" src="/assets/315f1.svg" />
            </div>
            <div className="flex flex-col items-center justify-center text-center whitespace-nowrap absolute inset-0">
              <p className="font-bold text-[#0d1b2e] text-[11px] leading-[16.5px]">전체</p>
              <p className="font-bold text-[#0d1b2e] text-[20px] leading-7">124.6</p>
              <p className="font-normal text-[#94afc8] text-[9px] leading-[13.5px]" style={{ fontFamily: 'Noto Sans KR' }}>/ 150 km</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-start pt-4 w-full">
          {[
            { emoji: '📍', label: '총 누적거리', value: '124.6', unit: 'km' },
            { emoji: '🏃', label: '러닝 횟수', value: '38', unit: '회' },
            { emoji: '🔥', label: '소모 칼로리', value: '8,420', unit: 'kcal' },
          ].map((s, i) => (
            <div key={i} className="border border-black flex-1 flex flex-col items-start px-[6px] py-2 rounded-[16px]">
              <div className="flex gap-[2px] items-center justify-center w-full">
                <span className="text-[10px] font-bold text-black text-center">{s.emoji}</span>
                <span className="text-[10px] font-bold text-black text-center">{s.label}</span>
              </div>
              <div className="h-[16px] relative w-full whitespace-nowrap mt-1 text-center">
                <p className="absolute font-bold text-[12px] text-black leading-4 left-0 top-0 w-full text-center">{s.value}<span className="font-normal text-[9px] text-[#7b8796]"> {s.unit}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabBar({ subTab, setSubTab }: { subTab: SubTab; setSubTab: (t: SubTab) => void }) {
  return (
    <div className="pt-3 px-4 shrink-0 w-full">
      <div className="flex gap-[6px] items-center">
        {(['records', 'badges', 'rankings'] as SubTab[]).map((t, i) => {
          const labels = ['기록', '배지', '랭킹'];
          const isActive = subTab === t;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`flex items-center justify-center px-[14px] py-[6px] rounded-full shrink-0 border text-[11px] font-bold whitespace-nowrap ${
                isActive ? 'bg-[#0570db] border-[#0570db] text-white' : 'bg-white border-[#d6e9f8] text-[#4a6080]'
              }`}
            >
              {labels[i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecordsTab() {
  return (
    <div className="flex flex-col items-start w-full">
      {/* Week filter */}
      <div className="flex gap-[6px] items-center px-4 pt-3 pb-1 w-full overflow-x-auto">
        {['7월 전체', '1주차', '2주차', '3주차', '4주차'].map((label, i) => (
          <button
            key={label}
            className={`flex items-center justify-center px-[14px] py-[6px] rounded-full shrink-0 border text-[11px] font-bold whitespace-nowrap ${
              i === 0 ? 'bg-[#0570db] border-[#0570db] text-white' : 'bg-white border-[#d6e9f8] text-[#4a6080]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Bar chart */}
      <div className="px-4 pt-2 w-full">
        <div className="bg-white rounded-[24px] p-4">
          <div className="flex gap-2 h-[96px] items-end w-full">
            {[
              { km: '28.2', h: 42, week: '1주', active: false },
              { km: '35.4', h: 53, week: '2주', active: false },
              { km: '31', h: 47, week: '3주', active: false },
              { km: '30', h: 45, week: '4주', active: true },
            ].map((bar) => (
              <div key={bar.week} className="flex flex-col gap-1 items-center flex-1">
                <p className="text-[#94afc8] text-[9px] font-normal" style={{ fontFamily: 'Noto Sans KR' }}>{bar.km}</p>
                <div
                  className={`rounded-[8px] w-full ${bar.active ? 'bg-[#0570db]' : 'bg-[#d6e9f8]'}`}
                  style={{ height: bar.h }}
                />
                <p className={`text-[9px] font-normal ${bar.active ? 'text-[#0570db]' : 'text-[#94afc8]'}`}>{bar.week}</p>
              </div>
            ))}
          </div>
          {/* Stats row */}
          <div className="flex items-start pt-3 border-t border-[#d6e9f8] mt-3">
            {[
              { label: '평균 페이스', value: `7'12"`, unit: '/km' },
              { label: '총 운동시간', value: '14h 20m', unit: '' },
              { label: '소모 칼로리', value: '8,420', unit: 'kcal' },
            ].map((s, i) => (
              <div key={i} className={`flex-1 flex flex-col items-center ${i < 2 ? 'border-r border-[#d6e9f8]' : ''}`}>
                <p className="text-[#94afc8] text-[9px] font-normal text-center">{s.label}</p>
                <p className="font-bold text-[#0d1b2e] text-[13px] text-center" style={{ fontFamily: 'Noto Sans KR' }}>
                  {s.value}<span className="font-normal text-[#94afc8] text-[10px]">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="px-4 pt-3 w-full">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-[14px] text-black">러닝 타임라인</p>
            <p className="text-[#7b8796] text-[12px] font-normal">최근 나의 러닝 기록을 살펴보세요!</p>
          </div>
          <button className="bg-[#d6e9f8] px-3 py-[4px] rounded-full">
            <p className="text-[#0570db] text-[12px] font-normal">전체보기</p>
          </button>
        </div>
        {[
          { time: '오늘 · 18:20', name: '광안리 해변 드로잉런', km: '5.2 km', min: '38분', pace: `7'18" /km`, dot: '#0570db', dotBorder: '#4d9fe8' },
          { time: '2일 전 · 07:15', name: '낙동강 생태공원 산책', km: '7.8 km', min: '55분', pace: `7'03" /km`, dot: '#d6e9f8', dotBorder: '#d6e9f8' },
          { time: '4일 전 · 20:00', name: '서면 생활권 빌리닝', km: '3.6 km', min: '24분', pace: `6'40" /km`, dot: '#d6e9f8', dotBorder: '#d6e9f8' },
        ].map((run, i) => (
          <div key={i} className="bg-white border border-[#d6e9f8] rounded-[24px] px-4 py-3 mb-2 flex gap-3 items-start">
            <div className="mt-1 shrink-0">
              <div className="w-[10px] h-[10px] rounded-[5px] border-2" style={{ backgroundColor: run.dot, borderColor: run.dotBorder }} />
            </div>
            <div className="flex-1">
              <p className="text-[#94afc8] text-[10px] font-normal" style={{ fontFamily: 'Noto Sans KR' }}>{run.time}</p>
              <p className="font-bold text-[#0d1b2e] text-[14px] leading-6">{run.name}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-[#4a6080] text-[11px]" style={{ fontFamily: 'Noto Sans KR' }}>🏃 {run.km}</span>
                <span className="text-[#4a6080] text-[11px]" style={{ fontFamily: 'Noto Sans KR' }}>⏱ {run.min}</span>
                <span className="text-[#4a6080] text-[11px]" style={{ fontFamily: 'Noto Sans KR' }}>⚡ {run.pace}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EARNED_BADGES = [
  { emoji: '👟', name: '베이비 러너', desc: '첫 1km 완주', date: '1월 15일', grad: 'linear-gradient(135deg,#a8edea,#fed6e3)', acquired: true, isNew: false },
  { emoji: '🌟', name: '10km 달성', desc: '누적 10km 돌파', date: '2월 3일', grad: 'linear-gradient(135deg,#ffecd2,#fcb69f)', acquired: true, isNew: false },
  { emoji: '💪', name: '50km 돌파', desc: '누적 50km 완주', date: '3월 20일', grad: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', acquired: true, isNew: false },
  { emoji: '🔥', name: '100km 달성', desc: '누적 100km 완주', date: '6월 1일', grad: 'linear-gradient(135deg,#fd7f6f,#fddb92)', acquired: true, isNew: true, border: '#6acf98' },
  { emoji: '⚡', name: '200km 목표', desc: '누적 200km 달성', date: '', acquired: false, progress: 71, progressVal: '142.8 / 200 km' },
  { emoji: '🏆', name: '500km 전설', desc: '누적 500km 완주', date: '', acquired: false, progress: 28, progressVal: '142.8 / 500 km' },
];

function BadgesTab() {
  return (
    <div className="flex flex-col items-start w-full px-4 pt-3">
      {/* Badge summary card */}
      <div className="bg-white border border-[#d6e9f8] rounded-[24px] p-5 w-full mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#94afc8] text-[11px] font-bold">획득한 배지</p>
            <div className="flex items-end gap-1 mt-[2px]">
              <p className="font-black text-[30px] text-[#0d1b2e] leading-9" style={{ fontFamily: 'Noto Sans KR' }}>10</p>
              <p className="font-normal text-[14px] text-[#94afc8] leading-5 pb-[4px]">/ 18개</p>
            </div>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-[16px]" style={{ backgroundImage: 'linear-gradient(145deg,#43e97b,#38f9d7)' }}>
            <span className="text-[24px] leading-7">🌳</span>
            <p className="font-black text-[10px] text-white mt-1">이번 달 +2개</p>
          </div>
        </div>
        <div className="flex gap-2 items-center pt-3">
          <div className="flex-1 bg-[#d6e9f8] rounded-full h-2 overflow-hidden">
            <div className="bg-[#0570db] h-2 rounded-full" style={{ width: '59%' }} />
          </div>
          <p className="text-[#0570db] text-[11px] font-bold">59%</p>
        </div>
        <div className="border-t border-[#d6e9f8] pt-3 mt-3 flex gap-2 items-center">
          {[{ icon: '🔥', sub: '배지 획득률', val: '상위 20%' }, { icon: '🏃', sub: '배지 타입', val: '새벽러너' }, { icon: '⭐', sub: '희귀 배지', val: '2개' }].map((s, i) => (
            <div key={i} className={`flex-1 flex flex-col items-center ${i < 2 ? 'border-r border-[#d6e9f8]' : ''}`}>
              <span className="text-[16px] leading-4">{s.icon}</span>
              <p className="text-[#94afc8] text-[9px] font-normal">{s.sub}</p>
              <p className="font-bold text-[#0d1b2e] text-[12px]" style={{ fontFamily: 'Noto Sans KR' }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Category filters */}
      <div className="flex gap-[6px] items-center pb-3 w-full overflow-x-auto">
        {['전체', '거리', '연속', '코스', '이벤트'].map((f, i) => (
          <button key={f} className={`flex items-center justify-center px-[14px] py-[6px] rounded-full shrink-0 border text-[11px] font-bold whitespace-nowrap ${i === 0 ? 'bg-[#0570db] border-[#0570db] text-white' : 'bg-white border-[#d6e9f8] text-[#4a6080]'}`}>
            {f}
          </button>
        ))}
      </div>
      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3 w-full pb-4">
        {EARNED_BADGES.map((b, i) => (
          <div key={i} className={`bg-white rounded-[24px] p-4 flex flex-col items-center shadow-sm ${b.acquired ? (b.border ? `border border-[${b.border}]` : 'border border-[#d6e9f8]') : 'border border-[#e8edf2] opacity-75'} relative`}>
            {b.isNew && <div className="absolute top-2.5 right-2.5 bg-[#6acf98] px-[6px] py-[2px] rounded-full"><p className="text-white text-[9px] font-black">NEW</p></div>}
            <div className="rounded-full size-[56px] flex items-center justify-center mb-2" style={{ background: b.acquired ? (b.grad || '#f0f3f6') : '#f0f3f6' }}>
              <span className="text-[24px]">{b.emoji}</span>
            </div>
            <p className={`font-bold text-[12px] text-center ${b.acquired ? 'text-[#0d1b2e]' : 'text-[#94afc8]'}`}>{b.name}</p>
            <p className={`text-[10px] text-center ${b.acquired ? 'text-[#94afc8]' : 'text-[#94afc8]'} mb-2`}>{b.desc}</p>
            {b.acquired ? (
              <div className="bg-[#d6e9f8] flex gap-1 items-center px-2 py-[2px] rounded-full">
                <span className="text-[#0570db] text-[10px] font-bold">✓</span>
                <span className="text-[#0570db] text-[10px] font-bold">{b.date}</span>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <p className="text-[#94afc8] text-[9px]">{b.progressVal}</p>
                  <p className="text-[#0570db] text-[9px] font-bold">{b.progress}%</p>
                </div>
                <div className="bg-[#e8edf2] h-[6px] rounded-full w-full overflow-hidden">
                  <div className="bg-[#0570db] h-[6px] rounded-full" style={{ width: `${b.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const RANKING_LIST = [
  { rank: 4, emoji: '🐤', name: '페가수스', badge: '마라토너', km: '98.4 km' },
  { rank: 5, emoji: '⚡', name: '광안리 번개', badge: '스프린터', km: '88.2 km' },
  { rank: 6, emoji: '🐊', name: '다정한악어', badge: '열정러너', km: '79.5 km' },
  { rank: 7, emoji: '🐵', name: '기운찬초보', badge: '꾸준러너', km: '72.1 km' },
  { rank: 8, emoji: '🐸', name: '폭풍질주', badge: '산책마스터', km: '65.4 km' },
  { rank: 9, emoji: '🐱', name: '깔끔한고양이', badge: '새벽러너', km: '58.0 km' },
];

function RankingsTab() {
  return (
    <div className="flex flex-col items-start w-full">
      {/* Title */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0 w-full">
        <p className="font-bold text-[14px] text-[#7b8796]">월간 누적 거리 랭킹</p>
        <button><p className="font-semibold text-[12px] text-[#60aedd]">챌린지 규칙</p></button>
      </div>
      {/* Top 3 podium */}
      <div className="flex gap-2 items-end justify-center pt-4 px-4 w-full">
        {/* 2nd */}
        <div className="flex flex-1 flex-col items-center">
          <div className="bg-[#f8f9fa] drop-shadow px-2 py-[2px] rounded-full mb-1">
            <p className="font-black text-[10px] text-black text-center">👑 2위</p>
          </div>
          <div className="bg-white border border-black drop-shadow flex flex-col gap-1 h-[140px] items-center justify-center rounded-[24px] w-full">
            <div className="bg-[#f9fafb] rounded-full size-[48px] flex items-center justify-center"><span className="text-[24px]">🐰</span></div>
            <p className="font-bold text-[12px] text-black text-center">해운대페메</p>
            <p className="font-bold text-[12px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR' }}>128.5<span className="font-normal text-[10px] text-[#7b8796]"> km</span></p>
            <div className="bg-[#f8f9fa] drop-shadow px-2 py-[2px] rounded-full"><p className="font-bold text-[10px] text-black">연속 21일</p></div>
          </div>
        </div>
        {/* 1st */}
        <div className="flex flex-1 flex-col items-center">
          <div className="bg-black drop-shadow px-2 py-[2px] rounded-full mb-1">
            <p className="font-black text-[10px] text-white text-center">👑 1위</p>
          </div>
          <div className="bg-white border-2 border-black drop-shadow-md flex flex-col gap-1 h-[156px] items-center justify-center rounded-[24px] w-full">
            <div className="bg-[#f9fafb] border-2 border-black rounded-full size-[56px] flex items-center justify-center"><span className="text-[30px]">🐱</span></div>
            <p className="font-bold text-[12px] text-black text-center">러닝왕강지훈</p>
            <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR' }}>142.8<span className="font-normal text-[10px] text-[#7b8796]"> km</span></p>
            <div className="bg-[#f8f9fa] drop-shadow px-2 py-[2px] rounded-full"><p className="font-bold text-[10px] text-black">월간 MVP</p></div>
          </div>
        </div>
        {/* 3rd */}
        <div className="flex flex-1 flex-col items-center">
          <div className="bg-[#f8f9fa] drop-shadow px-2 py-[2px] rounded-full mb-1">
            <p className="font-black text-[10px] text-black text-center">👑 3위</p>
          </div>
          <div className="bg-white border border-black drop-shadow flex flex-col gap-1 h-[140px] items-center justify-center rounded-[24px] w-full">
            <div className="bg-[#f9fafb] rounded-full size-[48px] flex items-center justify-center"><span className="text-[24px]">🐻</span></div>
            <p className="font-bold text-[12px] text-black text-center">매일뛰다보면</p>
            <p className="font-bold text-[12px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR' }}>115.2<span className="font-normal text-[10px] text-[#7b8796]"> km</span></p>
            <div className="bg-[#f8f9fa] drop-shadow px-2 py-[2px] rounded-full"><p className="font-bold text-[10px] text-black">연속 14일</p></div>
          </div>
        </div>
      </div>
      {/* Ranked list 4-9 */}
      <div className="flex flex-col gap-2 px-4 pt-3 w-full">
        {RANKING_LIST.map((r) => (
          <div key={r.rank} className="bg-white border border-black drop-shadow flex gap-3 items-center px-4 py-3 rounded-[24px] w-full">
            <div className="flex flex-col items-center w-8">
              <p className="font-bold text-[14px] text-black leading-5" style={{ fontFamily: 'Noto Sans KR' }}>{r.rank}</p>
              <div className="bg-[#f8f9fa] px-[6px] py-[2px] rounded-full">
                <p className="font-semibold text-[9px] text-[#7b8796] whitespace-nowrap">{r.badge}</p>
              </div>
            </div>
            <div className="bg-[#f9fafb] rounded-full size-[40px] flex items-center justify-center shrink-0">
              <span className="text-[20px]">{r.emoji}</span>
            </div>
            <p className="flex-1 font-bold text-[14px] text-black">{r.name}</p>
            <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR' }}>{r.km}</p>
          </div>
        ))}
      </div>
      {/* My rank */}
      <div className="px-4 pt-3 pb-4 w-full">
        <div className="border-[1.6px] border-black rounded-[24px] flex gap-3 items-center px-4 py-3 w-full shadow">
          <div className="flex flex-col items-center w-8">
            <p className="font-bold text-[14px] text-[#60aedd] leading-5" style={{ fontFamily: 'Noto Sans KR' }}>24</p>
            <div className="bg-[#60aedd] px-[6px] py-[2px] rounded-full">
              <p className="font-bold text-[9px] text-white">내 순위</p>
            </div>
          </div>
          <div className="bg-white border border-black rounded-full size-[40px] flex items-center justify-center shrink-0">
            <span className="text-[20px]">🐕</span>
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-[14px] text-[#60aedd] leading-5">야르렁</p>
            <p className="font-normal text-[10px] text-[#7b8796]">서면 생활권 · 연속 5일</p>
          </div>
          <p className="font-bold text-[16px] text-[#60aedd]" style={{ fontFamily: 'Noto Sans KR' }}>42.5 km</p>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4 w-full">
        <button className="flex-1 bg-white drop-shadow rounded-[24px] h-12 flex items-center justify-center">
          <p className="font-bold text-[14px] text-black">공유하기</p>
        </button>
        <button className="flex-1 bg-white drop-shadow-md rounded-[24px] h-12 flex items-center justify-center">
          <p className="font-bold text-[14px] text-black">1위 코스 따라뛰기</p>
        </button>
        <button className="bg-white border border-[#dce3f1] drop-shadow rounded-full size-12 flex items-center justify-center shrink-0">
          <img src="/assets/9bc92.svg" alt="" className="size-5" />
        </button>
      </div>
    </div>
  );
}

export default function RecordsScreen({ onNavigate }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('records');

  return (
    <div className="flex flex-col h-full relative bg-[#edf4fb]">
      <SharedHeader onBack={() => onNavigate('home')} />
      {/* 상단 배경 영역: 전체 720px 중 2/5 = 288px */}
      <div className="shrink-0 overflow-hidden" style={{ height: 288 }}>
        <StatsCard />
        <TabBar subTab={subTab} setSubTab={setSubTab} />
      </div>
      {/* 하단 배경 영역: 전체 720px 중 3/5 = 432px */}
      <div className="overflow-y-auto pb-[60px]" style={{ height: 432 }}>
        {subTab === 'records' && <RecordsTab />}
        {subTab === 'badges' && <BadgesTab />}
        {subTab === 'rankings' && <RankingsTab />}
      </div>
      <BottomNav active="records" onTabChange={(tab) => {
        if (tab === 'home') onNavigate('home');
        else if (tab === 'courses') onNavigate('courses');
        else if (tab === 'benefits') onNavigate('benefits');
        else if (tab === 'records') { /* already here */ }
        else if (tab === 'esg') onNavigate('esg' as Parameters<typeof onNavigate>[0]);
      }} />
    </div>
  );
}
