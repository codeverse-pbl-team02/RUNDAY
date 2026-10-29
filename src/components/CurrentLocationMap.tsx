import { useRun } from '../running/RunProvider';
import { useServiceArea } from '../location/ServiceAreaProvider';
import { KakaoMap } from './KakaoMap';
import { ServiceAreaNotice } from './ServiceAreaNotice';

export function CurrentLocationMap({ onBrowseCourses, showLocationButton = false, dense = false }: {
  onBrowseCourses: () => void;
  showLocationButton?: boolean;
  dense?: boolean;
}) {
  const run = useRun();
  const area = useServiceArea();
  return <>
    <div className="relative">
      <KakaoMap current={run.current} accuracy={run.accuracy} live compact dense={dense}
        overlay={area.status === 'outside' ? <ServiceAreaNotice onBrowseCourses={onBrowseCourses} /> : undefined} />
      {showLocationButton && <button type="button" disabled={run.locating} onClick={run.locate}
        className="absolute right-2 top-2 z-30 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[#0570db] shadow disabled:opacity-60">
        {run.locating ? '위치 확인 중…' : '내 위치 확인'}
      </button>}
    </div>
    {showLocationButton && area.status !== 'outside' && <p role="status" className="mt-2 text-[11px] text-[#4a6080]">{area.message}</p>}
  </>;
}
