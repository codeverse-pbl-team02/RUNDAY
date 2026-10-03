import { useMemo } from 'react';
import type { SavedRun } from './ActivityProvider';

export function WeeklyRunChart({ runs }: { runs: SavedRun[] }) {
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      return {
        label: ['월', '화', '수', '목', '금', '토', '일'][index],
        distanceMeters: runs.filter(run => run.startedAt >= date.getTime() && run.startedAt < next.getTime())
          .reduce((sum, run) => sum + run.distanceMeters, 0),
      };
    });
  }, [runs]);
  const max = Math.max(1000, ...days.map(day => day.distanceMeters));
  const total = days.reduce((sum, day) => sum + day.distanceMeters, 0);

  return <div className="bg-white border border-[#dce3f1] rounded-3xl p-4" aria-label="이번 주 요일별 러닝 거리 막대그래프">
    <div className="flex items-center justify-between mb-3">
      <p className="font-bold text-[13px] text-[#0d1b2e]">이번 주 러닝 기록</p>
      <p className="text-[12px] font-bold text-[#0570db]">총 {(total / 1000).toFixed(2)}km</p>
    </div>
    <div className="grid grid-cols-7 gap-2 items-end h-28 border-b border-[#dce3f1]" role="list">
      {days.map(day => <div key={day.label} role="listitem" aria-label={`${day.label}요일 ${(day.distanceMeters / 1000).toFixed(2)}킬로미터`} className="h-full flex flex-col items-center justify-end">
        <span className="text-[9px] text-[#4a6080] mb-1 tabular-nums">{day.distanceMeters ? (day.distanceMeters / 1000).toFixed(1) : ''}</span>
        <div className="w-full max-w-7 rounded-t-md bg-[#0570db]" style={{ height: day.distanceMeters ? `${Math.max(5, day.distanceMeters / max * 80)}%` : '3px', opacity: day.distanceMeters ? 1 : 0.2 }} />
      </div>)}
    </div>
    <div className="grid grid-cols-7 gap-2 pt-2 text-center text-[10px] text-[#7b8796]">
      {days.map(day => <span key={day.label}>{day.label}</span>)}
    </div>
  </div>;
}
