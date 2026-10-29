import { useEffect, useRef, useState } from 'react';
import { useRun, clockText } from '../running/RunProvider';
import { useServiceArea } from '../location/ServiceAreaProvider';
import { locationIssue } from '../location/serviceArea';
import { PlaceSearchField } from '../components/PlaceSearchField';
import { KakaoMap } from '../components/KakaoMap';
import { requestWalkingRoute, routingConfigured } from '../routing/client';
import { estimatedRunSeconds, parsePace, type PlannedRoute, type RouteEndpoint, type WalkingRoute } from '../routing/types';

export default function RoutePlannerScreen({ onBack, onStart, onOpenRunning }: {
  onBack: () => void; onStart: (route: PlannedRoute) => boolean; onOpenRunning: () => void;
}) {
  const run = useRun();
  const area = useServiceArea();
  const previous = run.session.plannedRoute;
  const [useCurrent, setUseCurrent] = useState(!previous);
  const [customStart, setCustomStart] = useState<RouteEndpoint | null>(previous?.start || null);
  const [end, setEnd] = useState<RouteEndpoint | null>(previous?.end || null);
  const [minutes, setMinutes] = useState(String(previous ? Math.floor(previous.paceSecondsPerKm / 60) : 7));
  const [seconds, setSeconds] = useState(String(previous ? previous.paceSecondsPerKm % 60 : 0));
  const [result, setResult] = useState<{ key: string; route: WalkingRoute } | null>(() => previous ? {
    key: JSON.stringify([previous.start.latitude, previous.start.longitude, previous.start.label,
      previous.end.latitude, previous.end.longitude, previous.end.label]), route: previous,
  } : null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const pace = parsePace(minutes, seconds);
  const currentIssue = run.current ? locationIssue(run.current, run.accuracy, Date.now()) : '현재 위치를 확인해 주세요.';
  const start: RouteEndpoint | null = useCurrent
    ? run.current && !currentIssue && area.canRecommendNearby ? { ...run.current, label: '현재 위치' } : null
    : customStart;
  const key = JSON.stringify([start?.latitude, start?.longitude, start?.label, end?.latitude, end?.longitude, end?.label]);
  const route = result?.key === key ? result.route : null;
  const active = run.mode !== 'idle' && !(run.mode === 'finished' && run.saved);

  useEffect(() => {
    request.current++; controller.current?.abort(); setBusy(false); setMessage('');
    return () => { request.current++; controller.current?.abort(); };
  }, [key]);

  async function calculate() {
    if (!start || !end || pace === null || active || busy) return;
    const version = ++request.current;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 30_000);
    setBusy(true); setMessage(''); setResult(null);
    try {
      const planned = await requestWalkingRoute(start, end, abort.signal);
      if (version === request.current) setResult({ key, route: planned });
    } catch (error) {
      if (version === request.current) setMessage(abort.signal.aborted ? '조회 시간이 초과되었습니다. 다시 시도해 주세요.'
        : error instanceof Error ? error.message : '경로를 조회하지 못했습니다. 다시 시도해 주세요.');
    } finally { clearTimeout(timeout); if (version === request.current) setBusy(false); }
  }

  return <div className="flex h-full flex-col bg-[#edf4fb]">
    <header className="flex h-14 shrink-0 items-center gap-3 px-4">
      <button type="button" onClick={onBack} aria-label="홈으로" className="p-2 text-[#0570db]">‹</button>
      <h1 className="text-[18px] font-bold">러닝 경로 찾기</h1>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
      <p className="mb-3 text-[12px] text-[#4a6080]">부산 내 출발지와 도착지를 선택하면 보행 경로와 예상 러닝 시간을 확인할 수 있어요.</p>
      {active && <div role="status" className="mb-3 rounded-2xl border border-[#f5d48a] bg-white p-4 text-[13px]">
        진행 중이거나 저장하지 않은 러닝이 있습니다. 먼저 종료·저장해 주세요.
        <button type="button" onClick={onOpenRunning} className="mt-2 block font-bold text-[#0570db]">진행 중인 러닝으로</button>
      </div>}
      <form className="flex flex-col gap-4 rounded-3xl bg-white p-4" onSubmit={event => { event.preventDefault(); void calculate(); }}>
        <div>
          <p className="mb-2 text-[13px] font-bold">출발지 선택</p>
          <div className="mb-3 flex gap-2">
            {[{ current: true, text: '현재 위치' }, { current: false, text: '장소 검색' }].map(option => <button key={option.text} type="button"
              aria-pressed={useCurrent === option.current} onClick={() => setUseCurrent(option.current)}
              className={`flex-1 rounded-xl border px-3 py-2 text-[12px] ${useCurrent === option.current ? 'border-[#0570db] bg-[#edf4fb] text-[#0570db]' : 'border-[#dce3f1] text-[#7b8796]'}`}>{option.text}</button>)}
          </div>
          {useCurrent ? <div className="rounded-xl bg-[#f5f8fc] p-3 text-[12px] text-[#4a6080]">
            <p role="status">{start ? area.address || '현재 GPS 위치를 출발지로 사용합니다.' : run.locationError || currentIssue || area.message}</p>
            {area.status === 'outside' && <p className="mt-1">현재 부산 외 지역입니다. 부산 내 장소를 검색해 출발지로 선택할 수 있습니다.</p>}
            <button type="button" disabled={run.locating} onClick={run.locate} className="mt-2 py-2 font-bold text-[#0570db] disabled:opacity-50">{run.locating ? '위치 확인 중…' : '현재 위치 확인'}</button>
          </div> : <PlaceSearchField label="출발지" value={customStart} onChange={setCustomStart} />}
        </div>
        <PlaceSearchField label="도착지" value={end} onChange={setEnd} />
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold">목표 페이스 · 1km당</legend>
          <div className="flex items-center gap-2 text-[13px]">
            <input aria-label="페이스 분" type="number" min="2" max="30" step="1" value={minutes} onChange={event => setMinutes(event.target.value)} className="w-20 rounded-xl border border-[#dce3f1] px-3 py-2" />분
            <input aria-label="페이스 초" type="number" min="0" max="59" step="1" value={seconds} onChange={event => setSeconds(event.target.value)} className="w-20 rounded-xl border border-[#dce3f1] px-3 py-2" />초
          </div>
          {pace === null && <p role="alert" className="mt-1 text-[11px] text-red-600">2분 00초~30분 00초 사이로 입력해 주세요.</p>}
        </fieldset>
        {!routingConfigured && <p role="status" className="text-[12px] text-[#7b8796]">경로 찾기 서비스를 준비 중입니다. 잠시 후 다시 이용해 주세요.</p>}
        <button disabled={!start || !end || pace === null || active || busy || !routingConfigured}
          className="rounded-2xl bg-[#0570db] px-4 py-3 text-[14px] font-bold text-white disabled:opacity-50">{busy ? '보행 경로 찾는 중…' : '보행 경로 찾기'}</button>
      </form>
      {message && <p role="alert" className="mt-3 rounded-2xl bg-white p-4 text-[13px] text-red-600">{message}</p>}
      {route && pace !== null && <section aria-label="추천 경로 미리보기" className="mt-4 rounded-3xl bg-white p-4">
        <h2 className="text-[15px] font-bold">{route.start.label} → {route.end.label}</h2>
        <p className="mt-2 text-[14px] font-bold text-[#0570db]">{(route.distanceMeters / 1000).toFixed(2)}km · 예상 {clockText(estimatedRunSeconds(route.distanceMeters, pace))}</p>
        <p className="mt-1 text-[11px] text-[#7b8796]">입력한 페이스 기준 · 신호 대기와 휴식 시간 제외</p>
        <KakaoMap guidePoints={route.points} />
        <p className="mt-2 text-[11px] text-[#7b8796]">카카오맵 도보 경로입니다. 실제 통행 가능 여부를 확인하며 달려주세요.</p>
        {route.instructions.length > 0 && <details className="mt-3 text-[12px] text-[#4a6080]">
          <summary className="cursor-pointer py-2">경로 안내 보기</summary>
          <ol className="list-decimal space-y-2 pl-5">{route.instructions.map((step, index) => <li key={index}>{step.description}</li>)}</ol>
        </details>}
        <button type="button" disabled={active || busy} onClick={() => {
          if (!onStart({ ...route, paceSecondsPerKm: pace })) setMessage('러닝을 시작하지 못했습니다. 위치 권한과 진행 중인 기록을 확인해 주세요.');
        }}
          className="mt-4 w-full rounded-2xl bg-[#4cb57d] py-3 text-[14px] font-bold text-white disabled:opacity-50">이 경로로 러닝 시작</button>
      </section>}
    </div>
  </div>;
}
