import { useEffect, useRef, useState } from 'react';
import { kakaoMapConfigured, loadKakaoMaps, type KakaoMaps, type MapInstance, type MapOverlay } from '../lib/kakaoMap';
import type { Point } from '../running/RunProvider';

const noPoints: Point[] = [];
function valid(point: Point) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

export function KakaoMap({ current = null, points = noPoints, accuracy = null, live = false }: {
  current?: Point | null; points?: Point[]; accuracy?: number | null; live?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<{ sdk: KakaoMaps; map: MapInstance } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [centerRequest, setCenterRequest] = useState(0);
  const route = points.filter(valid);
  const location = current && valid(current) ? current : route[route.length - 1];
  const hasLocation = Boolean(location);
  const initial = useRef(location);
  initial.current = location;

  useEffect(() => {
    if (!kakaoMapConfigured || !hasLocation || !container.current) return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    const element = container.current;
    setStatus('loading');
    loadKakaoMaps().then(sdk => {
      if (disposed || !initial.current) return;
      const point = initial.current;
      const map = new sdk.Map(element, { center: new sdk.LatLng(point.latitude, point.longitude), level: 3 });
      instance.current = { sdk, map };
      observer = new ResizeObserver(() => {
        const center = map.getCenter();
        map.relayout();
        map.setCenter(center);
      });
      observer.observe(element);
      setStatus('ready');
    }).catch(() => { if (!disposed) setStatus('error'); });
    return () => {
      disposed = true;
      observer?.disconnect();
      instance.current = null;
      element.replaceChildren();
    };
  }, [hasLocation, attempt]);

  useEffect(() => {
    if (status !== 'ready' || !instance.current || !location) return;
    const { sdk, map } = instance.current;
    const overlays: MapOverlay[] = [];
    const position = new sdk.LatLng(location.latitude, location.longitude);
    overlays.push(new sdk.Marker({ map, position, title: current ? '현재 위치' : '러닝 종료 위치' }));
    if (current && accuracy !== null && Number.isFinite(accuracy) && accuracy > 0) {
      overlays.push(new sdk.Circle({ map, center: position, radius: accuracy, strokeWeight: 1,
        strokeColor: '#0570db', strokeOpacity: 0.4, fillColor: '#0570db', fillOpacity: 0.12 }));
    }
    // Never connect across a pause, a missing GPS interval, or an invalid point.
    let segment: Point[] = [];
    const draw = () => {
      if (segment.length > 1) overlays.push(new sdk.Polyline({ map,
        path: segment.map(p => new sdk.LatLng(p.latitude, p.longitude)),
        strokeWeight: 4, strokeColor: '#0570db', strokeOpacity: 0.9 }));
    };
    for (const point of points) {
      if (!valid(point)) { draw(); segment = []; continue; }
      if (segment.length && segment[0].segment !== point.segment) { draw(); segment = []; }
      segment.push(point);
    }
    draw();
    if (route.length > 1 && !live) {
      const bounds = new sdk.LatLngBounds();
      route.forEach(p => bounds.extend(new sdk.LatLng(p.latitude, p.longitude)));
      map.setBounds(bounds, 32, 32, 32, 32);
    } else map.setCenter(position);
    return () => overlays.forEach(overlay => overlay.setMap(null));
    // Primitive coordinates avoid redrawing the map on the elapsed-time timer.
  }, [status, attempt, points, location?.latitude, location?.longitude, current !== null, accuracy, live, centerRequest]);

  const message = !kakaoMapConfigured ? '지도를 준비 중입니다. 위치 확인과 러닝 기록은 이용할 수 있습니다.'
    : !hasLocation ? '위치를 확인하면 주변 지도가 표시됩니다.'
    : status === 'error' ? `지도를 불러오지 못했습니다. Kakao Developers의 뛴데이 앱에서 카카오맵 → 사용 설정을 ON으로 바꾸고, JavaScript SDK 도메인에 ${window.location.origin}이 등록됐는지 확인해 주세요.`
    : '지도를 불러오는 중…';
  return <div className="mt-3">
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#f5f8fc]">
      <div ref={container} role="region" aria-label={live ? '현재 위치와 러닝 경로 지도' : '위치와 이동 경로 지도'} className="h-[240px] w-full" />
      {(!kakaoMapConfigured || !hasLocation || status !== 'ready') && <div role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-5 text-center text-[12px] text-[#7b8796] bg-[#f5f8fc]">
        <p>{message}</p>
        {kakaoMapConfigured && hasLocation && status === 'error' && <button type="button" onClick={() => setAttempt(a => a + 1)} className="rounded-full border border-[#0570db] px-4 py-2 text-[#0570db]">지도 다시 불러오기</button>}
      </div>}
    </div>
    {kakaoMapConfigured && hasLocation && status === 'ready' && <button type="button" onClick={() => setCenterRequest(v => v + 1)} className="mt-2 text-[12px] text-[#0570db] py-1">{route.length > 1 && !live ? '전체 경로 보기' : '현재 위치로 이동'}</button>}
  </div>;
}
