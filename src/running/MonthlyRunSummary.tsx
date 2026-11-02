import { useEffect, useRef, useState } from 'react';
import { useActivity } from './ActivityProvider';
import { monthlyStats } from './monthlyStats';

export default function MonthlyRunSummary() {
  const { runs, loading, error } = useActivity();
  const [now, setNow] = useState(() => new Date());
  const [offset, setOffset] = useState(0);
  const gesture = useRef<{x:number; y:number; id:number} | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const selected = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const stats = monthlyStats(runs, selected.getFullYear(), selected.getMonth(), now);
  const km = stats.distanceKm.toFixed(1);
  const percentage = Math.round(stats.distanceKm / 150 * 100);
  const firstRun = runs.reduce((earliest, run) => Math.min(earliest, run.startedAt), now.getTime());
  const first = new Date(firstRun);
  // Always allow at least the previous month, including accounts without records.
  const earliestOffset = Math.min(-1, (first.getFullYear()-now.getFullYear())*12 + first.getMonth()-now.getMonth());
  const canPrevious = offset > earliestOffset;
  const canNext = offset < 0;
  const move = (direction: number) => setOffset(value => Math.min(0, Math.max(earliestOffset, value + direction)));
  const streakText = offset === 0
    ? stats.currentStreak ? `🔥 ${stats.currentStreak}일간 연속 운동 중` : `🔥 이번 달 ${stats.activeDays}일 운동했어요`
    : `🔥 최장 ${stats.longestStreak}일 연속 운동`;
  return <section aria-label="월별 누적 러닝 기록" className="mx-4 mb-3 rounded-3xl border border-[#dce3f1] bg-white px-5 py-4 shadow-sm"
    style={{touchAction:'pan-y'}}
    onPointerDown={e => {
      if (!e.isPrimary || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
      gesture.current = {x:e.clientX,y:e.clientY,id:e.pointerId};
      e.currentTarget.setPointerCapture(e.pointerId);
    }}
    onPointerCancel={() => {gesture.current=null;}}
    onPointerUp={e => {
      const start=gesture.current; gesture.current=null;
      if (!start || start.id!==e.pointerId) return;
      const dx=e.clientX-start.x, dy=e.clientY-start.y;
      if (Math.abs(dx)>=45 && Math.abs(dx)>Math.abs(dy)*1.3) move(dx>0?-1:1);
    }}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 aria-live="polite" className="text-[16px] font-bold text-[#0d1b2e]">{selected.getFullYear() !== now.getFullYear() ? `${selected.getFullYear()}년 ` : ''}{selected.getMonth()+1}월 누적 기록</h2>
      <div className="flex gap-1">
        <button type="button" aria-label="이전 달 기록" disabled={!canPrevious || loading || !!error} onClick={() => move(-1)} className="flex size-6 items-center justify-center rounded-full bg-[#edf4fb] text-[#285b78] disabled:opacity-30">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m7.5 3-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" aria-label="다음 달 기록" disabled={!canNext || loading || !!error} onClick={() => move(1)} className="flex size-6 items-center justify-center rounded-full bg-[#edf4fb] text-[#285b78] disabled:opacity-30">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m4.5 3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
    {loading ? <p role="status" className="py-6 text-xs text-[#61758c]">기록을 불러오는 중이에요…</p> : error
      ? <p role="alert" className="py-4 text-xs text-red-600">{error}</p> : <>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[#4a6080]">{offset===0?'이달의 러닝':`${selected.getMonth()+1}월의 러닝`}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#b75d31]">{streakText}</p>
          <p className="my-2 break-words text-[32px] font-extrabold leading-tight text-[#0d1b2e] tabular-nums">{km}<span className="ml-1 text-[14px] font-normal text-[#94afc8]">km</span></p>
          <p className="inline-block rounded-full bg-[#e1f1fa] px-2 py-1 text-[10px] text-[#285b78]">기본 목표 150km · {percentage}%</p>
        </div>
        <div className="relative size-[96px] shrink-0" role="img" aria-label={`월간 누적 ${km}km, 기본 목표 대비 ${percentage}%`}>
          <svg viewBox="0 0 104 104" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="52" cy="52" r="45" fill="none" stroke="#e5eff7" strokeWidth="7"/>
            <circle cx="52" cy="52" r="45" fill="none" stroke="#8bc6e4" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${2*Math.PI*45*Math.min(1,stats.distanceKm/150)} ${2*Math.PI*45}`}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#61758c]">월간 거리</span><span className="text-lg font-bold text-[#0d1b2e]">{km}</span><span className="text-[9px] text-[#94afc8]">/ 150km</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">{[
        {icon:'📍',label:'누적 거리',value:km,unit:'km'},
        {icon:'🏃',label:'러닝 횟수',value:stats.count,unit:'회'},
        {icon:'⏱️',label:'러닝 시간',value:stats.minutes,unit:'분'},
      ].map(item => <div key={item.label} className="min-w-0 flex-1 rounded-2xl border border-[#dce3f1] bg-[#f4f9fd] px-1 py-2 text-center">
        <p className="text-[10px] font-bold text-[#4a6080]">{item.icon} {item.label}</p>
        <p className="mt-1 break-words text-xs font-bold text-[#0d1b2e]">{item.value}<span className="ml-0.5 text-[9px] font-normal text-[#94afc8]">{item.unit}</span></p>
      </div>)}</div>
    </>}
  </section>;
}
