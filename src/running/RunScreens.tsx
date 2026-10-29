import { useMemo, useState } from 'react';
import { clockText, paceText, useRun, type Point } from './RunProvider';
import { useActivity } from './ActivityProvider';
import { WeeklyRunChart } from './WeeklyRunChart';
import { KakaoMap } from '../components/KakaoMap';
import { useServiceArea } from '../location/ServiceAreaProvider';
import { CurrentLocationMap } from '../components/CurrentLocationMap';
import { getCourseGuide } from './courseGuide';
import { measureRouteProgress } from './routeProgress';
import { useBackAction } from '../navigation/useBackAction';

const primary = 'w-full rounded-3xl bg-[#0570db] text-white font-bold py-3 text-[14px] disabled:opacity-50';
export function RoutePreview({ points }: { points: Point[] }) {
  return <KakaoMap points={points} />;
}
export function LocationCard({ onBrowseCourses }: { onBrowseCourses: () => void }) {
  const run = useRun();
  const area = useServiceArea();
  return <div className="mx-4 mb-3 bg-white border border-[#dce3f1] rounded-3xl p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="font-bold text-[14px]">📍 현재 위치</p>
      <button type="button" disabled={run.locating} onClick={run.locate} className="text-[12px] text-[#0570db] py-1 px-2 disabled:opacity-50">{run.locating ? '확인 중…' : '위치 확인'}</button>
    </div>
    {run.current ? <>
      <p role="status" className="text-[12px] text-[#4a6080]">{area.address || area.message}</p>
      <p className="text-[11px] text-[#7b8796] mt-1">오차 약 {Math.round(run.accuracy || 0)}m · {new Date(run.current.timestamp).toLocaleTimeString('ko-KR')} 확인</p>
    </> : <p className="text-[12px] text-[#7b8796]">버튼을 눌러 위치 권한을 허용해 주세요.</p>}
    <div className="mt-2"><CurrentLocationMap onBrowseCourses={onBrowseCourses} dense /></div>
    {run.message && <p role="status" className="text-[12px] text-[#7b8796] mt-2">{run.message}</p>}
  </div>;
}
export function RunningScreen({ onBack, onRecords }: { onBack: () => void; onRecords: () => void }) {
  const run = useRun();
  const planned = run.session.plannedRoute;
  const guide = planned ? { name: planned.name, points: planned.points } : getCourseGuide(run.session.courseId);
  const progress = useMemo(() => guide ? measureRouteProgress(guide.points, run.session.points) : null, [guide?.points, run.session.points]);
  const [discard, setDiscard] = useState(false);
  useBackAction(discard, () => setDiscard(false));
  const started = run.mode !== 'idle';
  return <div className="h-full flex flex-col bg-[#edf4fb]">
    <div className="h-14 px-4 flex items-center gap-3 shrink-0">
      <button onClick={onBack} className="text-[#0570db] p-2" aria-label="홈으로">‹</button>
      <h1 className="text-[18px] font-bold">{guide?.name ?? 'GPS 러닝'}</h1>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pb-5 flex flex-col gap-3 [&>*]:shrink-0">
      <div className="bg-white rounded-3xl p-5 border border-[#dce3f1]">
        <p className="text-[12px] text-[#0570db]">{({ idle: '달릴 준비', locating: 'GPS 연결 중', running: '러닝 중', paused: '일시정지', finished: '러닝 종료' })[run.mode]}</p>
        <p className="text-[42px] font-black text-[#0d1b2e] tabular-nums">{(run.session.distance / 1000).toFixed(2)} <span className="text-[15px]">km</span></p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div><p className="text-[11px] text-[#94afc8]">활동 시간</p><p className="text-[22px] font-bold tabular-nums">{clockText(run.elapsed)}</p></div>
          <div><p className="text-[11px] text-[#94afc8]">평균 페이스 /km</p><p className="text-[22px] font-bold">{paceText(run.session.distance, run.elapsed)}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-4 border border-[#dce3f1]">
        <p className="text-[13px] font-bold mb-2">{guide ? '코스 안내 · 이동 경로' : '이동 경로'}</p>
        {guide && <>
          <p className="text-[11px] text-[#4a6080]">회색: 안내 경로 · 진한 파랑: 따라 달린 구간 · 연한 파랑: 실제 GPS 이동</p>
          {progress && <p className="text-[12px] font-bold text-[#0570db] mt-1">코스 진행 {(progress.completedMeters / 1000).toFixed(2)} / {(progress.totalMeters / 1000).toFixed(2)}km</p>}
          <p className="text-[11px] text-[#7b8796] mt-1">{planned ? '카카오맵 도보 경로입니다. 출발점 근처에서 러닝을 시작해 주세요.' : '지도 경로는 제공된 GPX를 사용합니다.'} 실제 통행 가능 여부는 현장에서 확인해 주세요.</p>
          {planned && <p className="mt-1 text-[11px] text-[#0570db]">목표 페이스 {Math.floor(planned.paceSecondsPerKm / 60)}분 {planned.paceSecondsPerKm % 60}초 /km</p>}
        </>}
        <KakaoMap points={run.session.points} guidePoints={guide?.points} completedGuidePoints={progress?.completedPath} current={run.mode === 'finished' ? null : run.current} accuracy={run.mode === 'finished' ? null : run.accuracy} live={run.mode !== 'finished'} />
        {run.accuracy !== null && <p className="text-[11px] text-[#7b8796]">위치 오차 약 {Math.round(run.accuracy)}m · 거리와 페이스는 추정값입니다.</p>}
      </div>
      <p className="text-[12px] text-[#4a6080]">러닝 중 화면을 켜 두세요. 다른 앱으로 이동하면 자동 일시정지됩니다. 종료 후 저장하면 이동 경로가 내 계정에 보관됩니다.</p>
      {run.message && <p role="status" className="text-[12px] text-[#0570db]">{run.message}</p>}
      {run.mode === 'idle' && <button onClick={() => planned ? run.startRoute(planned) : run.start(run.session.courseId)} className={primary}>러닝 시작하기</button>}
      {run.mode === 'locating' && <button onClick={run.pause} className={primary}>위치 찾기 취소</button>}
      {run.mode === 'running' && <button onClick={run.pause} className={primary}>일시정지</button>}
      {run.mode === 'paused' && <button onClick={run.resume} className={primary}>이어 달리기</button>}
      {(run.mode === 'running' || run.mode === 'paused') && <button onClick={run.finish} className="rounded-3xl border border-[#0570db] text-[#0570db] py-3 font-bold">러닝 종료</button>}
      {run.mode === 'finished' && !run.saved && <button disabled={run.saving} onClick={() => void run.save()} className={primary}>{run.saving ? '저장 중…' : '내 러닝 기록 저장'}</button>}
      {run.saved && <button onClick={onRecords} className={primary}>저장된 기록 보기</button>}
      {started && !run.saved && <button disabled={run.saving} onClick={() => setDiscard(true)} className="text-[12px] text-[#7b8796] py-2">기록 버리기</button>}
      {run.saved && <button onClick={run.reset} className="text-[#0570db] py-2">새 러닝</button>}
      {discard && <div role="alert" className="rounded-2xl bg-white p-4 text-[13px]">
        <p>저장하지 않은 경로와 기록을 버릴까요?</p>
        <div className="flex gap-4 mt-3"><button onClick={() => { run.reset(); setDiscard(false); }} className="text-red-600">버리기</button><button onClick={() => setDiscard(false)}>계속 기록</button></div>
      </div>}
    </div>
  </div>;
}
export function RunHistory({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const { runs, loading, error } = useActivity();
  const [selected, setSelected] = useState<string | null>(null);
  useBackAction(selected !== null, () => setSelected(null));
  return <div className="h-full bg-[#edf4fb] flex flex-col">
    <div className="h-14 shrink-0 px-4 flex items-center gap-3"><button aria-label="홈으로" onClick={onBack} className="p-2 text-[#0570db]">‹</button><h1 className="font-bold text-[18px]">내 GPS 러닝 기록</h1></div>
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pb-5 flex flex-col gap-3 [&>*]:shrink-0">
      <button onClick={onStart} className={primary}>GPS 러닝 시작</button>
      {!loading && !error && <WeeklyRunChart runs={runs} />}
      <p className="text-[12px] text-[#7b8796]">저장한 러닝 기록 {runs.length}개</p>
      {loading && <p role="status">기록을 불러오는 중…</p>}
      {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}
      {!loading && !error && !runs.length && <p className="bg-white rounded-3xl p-5 text-[13px] text-[#7b8796]">아직 저장한 러닝이 없습니다. 첫 러닝을 시작해 보세요.</p>}
      {runs.map(run => <div key={run.id} className="bg-white border border-[#dce3f1] rounded-3xl p-4">
        <p className="text-[12px] text-[#7b8796]">{new Date(run.startedAt).toLocaleString('ko-KR')}</p>
        <p className="text-[26px] font-black text-[#0570db]">{(run.distanceMeters / 1000).toFixed(2)} km</p>
        <p className="text-[13px]">{clockText(run.durationSeconds)} · {paceText(run.distanceMeters, run.durationSeconds)} /km</p>
        <button onClick={() => setSelected(selected === run.id ? null : run.id)} aria-expanded={selected === run.id} className="text-[#0570db] text-[12px] mt-3 py-2">{selected === run.id ? '경로 접기' : '이동 경로 보기'}</button>
        {selected === run.id && <RoutePreview points={run.points} />}
      </div>)}
    </div>
  </div>;
}
export function RunBanner({ onOpen }: { onOpen: () => void }) {
  const run = useRun();
  if (run.mode === 'idle' || run.saved) return null;
  return <button onClick={onOpen} className="absolute bottom-[76px] right-3 z-40 bg-[#0570db] rounded-full px-4 py-2 shadow-lg text-white text-[12px]">🏃 러닝으로 · {clockText(run.elapsed)}</button>;
}
