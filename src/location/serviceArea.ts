import type { RegionInfo } from '../lib/kakaoMap';

export const MAX_LOCATION_AGE_MS = 5 * 60_000;
export const MAX_LOCATION_ACCURACY_METERS = 100;
export interface LocationFix { latitude: number; longitude: number; timestamp: number }
export interface ServiceAreaState {
  status: 'idle' | 'locating' | 'checking' | 'inside' | 'outside' | 'error';
  address: string | null;
  regionName: string | null;
  message: string;
  canRecommendNearby: boolean;
}

export function areaState(status: ServiceAreaState['status'], message: string): ServiceAreaState {
  return { status, message, address: null, regionName: null, canRecommendNearby: false };
}

export function locationIssue(point: LocationFix, accuracy: number | null, now: number): string | null {
  if (![point.latitude, point.longitude, point.timestamp].every(Number.isFinite)
    || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180 || point.timestamp > now + 5000) {
    return '위치 정보를 확인할 수 없습니다. 위치를 다시 확인해 주세요.';
  }
  if (now - point.timestamp >= MAX_LOCATION_AGE_MS) return '위치 정보가 오래되었습니다. 위치를 다시 확인해 주세요.';
  if (accuracy === null || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > MAX_LOCATION_ACCURACY_METERS) {
    return '위치 오차가 커 서비스 지역을 확인할 수 없습니다. 실외에서 위치를 다시 확인해 주세요.';
  }
  return null;
}

export function classifyRegion(region: RegionInfo | null): ServiceAreaState {
  if (!region?.region_1depth_name?.trim()) {
    return areaState('error', '현재 위치의 서비스 지역을 확인하지 못했습니다. 위치를 다시 확인해 주세요.');
  }
  const regionName = region.region_1depth_name.trim();
  const inside = regionName === '부산광역시';
  return { status: inside ? 'inside' : 'outside', regionName,
    address: region.address_name || regionName, canRecommendNearby: inside,
    message: inside ? '부산 지역입니다. 부산 코스를 둘러보세요.' : '현재 부산 외 지역입니다.' };
}
