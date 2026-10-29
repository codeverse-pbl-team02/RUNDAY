import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRun } from '../running/RunProvider';
import { useServiceArea } from './ServiceAreaProvider';

export function RunningServiceGate({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  const run = useRun();
  const area = useServiceArea();
  const previouslyAllowed = useRef(false);
  const [saveError, setSaveError] = useState('');
  const active = run.mode === 'running' || run.mode === 'locating';
  const allowed = area.status === 'inside' || (previouslyAllowed.current && active
    && (area.status === 'checking' || area.status === 'locating'));
  useEffect(() => {
    if (area.status === 'inside') previouslyAllowed.current = true;
    if (area.status === 'outside' || area.status === 'error') {
      previouslyAllowed.current = false;
      if (active) run.pause();
    }
  }, [area.status, active, run.pause]);
  useEffect(() => {
    if (!run.current && !run.locating && !run.locationError && !active) run.locate();
  }, [run.current, run.locating, run.locationError, active, run.locate]);
  if (allowed) return children;
  const outside = area.status === 'outside';
  const checking = run.locating || area.status === 'checking' || area.status === 'locating';
  return <div className="flex h-full flex-col bg-[#edf4fb]">
    <header className="flex h-14 shrink-0 items-center gap-3 px-4">
      <button type="button" onClick={onBack} aria-label="홈으로 돌아가기" className="p-2 text-xl text-[#285b78]">‹</button>
      <h1 className="text-base font-bold">서비스 지역 확인</h1>
    </header>
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-5">
      <section role="status" className="w-full max-w-sm rounded-3xl border border-[#dce3f1] bg-white p-6 text-center">
        <div aria-hidden="true" className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#e1f1fa] text-2xl">📍</div>
        <h2 className="text-lg font-bold text-[#285b78]">{outside ? '서비스 이용 가능 위치가 아닙니다' : checking ? '현재 위치를 확인하고 있어요' : '서비스 지역 확인이 필요합니다'}</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-[#61758c]">{outside
          ? '자유 러닝과 드로잉 러닝은 부산광역시 안에서만 이용할 수 있습니다. 부산 지역에서 위치를 다시 확인해 주세요.'
          : area.message || '정확한 현재 위치를 확인한 후 러닝을 시작할 수 있습니다.'}</p>
        {!checking && <button type="button" onClick={run.locate} className="mt-5 w-full rounded-2xl bg-[#bde3f6] px-4 py-3 text-[13px] font-bold text-[#285b78]">현재 위치 다시 확인</button>}
        {!run.saved && run.session.points.length > 0 && <button type="button" disabled={run.saving} onClick={async () => {
          setSaveError(''); run.finish();
          if (!await run.save()) setSaveError('기록을 저장하지 못했습니다. 다시 시도해 주세요.');
        }} className="mt-2 w-full rounded-2xl bg-[#d4eee3] px-4 py-3 text-[13px] font-bold text-[#2f6853] disabled:opacity-50">{run.saving ? '저장 중…' : '지금까지의 러닝 종료 후 저장'}</button>}
        {saveError && <p role="alert" className="mt-2 text-xs text-red-600">{saveError}</p>}
        <button type="button" onClick={onBack} className="mt-2 w-full rounded-2xl bg-[#edf4fb] px-4 py-3 text-[13px] font-bold text-[#285b78]">홈으로 돌아가기</button>
      </section>
    </div>
  </div>;
}
