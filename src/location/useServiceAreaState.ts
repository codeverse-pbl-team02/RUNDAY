import { useEffect, useRef, useState } from 'react';
import { kakaoMapConfigured, lookupRegion, type RegionInfo } from '../lib/kakaoMap';
import { areaState, classifyRegion, locationIssue, MAX_LOCATION_AGE_MS, type LocationFix, type ServiceAreaState } from './serviceArea';

interface Input {
  point: LocationFix | null;
  accuracy: number | null;
  locating: boolean;
  locationError: string | null;
  enabled: boolean;
}

export function useServiceAreaState(input: Input, lookup = lookupRegion): ServiceAreaState {
  const { point, accuracy, locating, locationError, enabled } = input;
  const [resolution, setResolution] = useState<{ key: string; state: ServiceAreaState } | null>(null);
  const [, expire] = useState(0);
  const cache = useRef<{ latitude: number; longitude: number; at: number; region: RegionInfo } | null>(null);
  const issue = point ? locationIssue(point, accuracy, Date.now()) : null;
  const key = point ? `${point.latitude}:${point.longitude}:${point.timestamp}` : '';
  const blocked = !enabled ? areaState('idle', '')
    : locating ? areaState('locating', '현재 위치를 확인하고 있습니다…')
    : locationError ? areaState('error', locationError)
    : !point ? areaState('idle', '위치 확인을 눌러 위치 권한을 허용해 주세요.')
    : issue ? areaState('error', issue)
    : !kakaoMapConfigured ? areaState('error', '서비스 지역을 확인할 수 없습니다. 잠시 후 위치를 다시 확인해 주세요.')
    : null;
  const blockedStatus = blocked?.status;

  useEffect(() => {
    if (blockedStatus || !point) return;
    let cancelled = false;
    const expiration = window.setTimeout(() => expire(value => value + 1),
      Math.max(0, point.timestamp + MAX_LOCATION_AGE_MS - Date.now()));
    // Coalesce StrictMode mounts and quick successive GPS updates.
    const request = window.setTimeout(() => {
      const previous = cache.current;
      const cached = previous && previous.latitude === point.latitude && previous.longitude === point.longitude
        && Date.now() - previous.at < 30_000;
      const result = cached ? Promise.resolve(previous.region) : lookup(point.latitude, point.longitude);
      void result.then(region => {
        if (cancelled) return;
        if (region && !cached) cache.current = { latitude: point.latitude, longitude: point.longitude, at: Date.now(), region };
        setResolution({ key, state: classifyRegion(region) });
      }).catch(() => {
        if (!cancelled) setResolution({ key, state: areaState('error', '서비스 지역을 불러오지 못했습니다. 위치를 다시 확인해 주세요.') });
      });
    }, 250);
    return () => { cancelled = true; clearTimeout(request); clearTimeout(expiration); };
  }, [key, accuracy, blockedStatus, lookup]);

  // A new GPS fix immediately hides the previous region, before the effect runs.
  return blocked ?? (resolution?.key === key ? resolution.state : areaState('checking', '서비스 지역을 확인하고 있습니다…'));
}
