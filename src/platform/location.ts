import { Geolocation } from '@capacitor/geolocation';
import { isNative } from './native';

interface LocationPosition {
  timestamp: number;
  coords: { latitude: number; longitude: number; accuracy: number };
}
export interface LocationError { code: number; message: string }
type Success = (position: LocationPosition) => void;
type Failure = (error: LocationError) => void;

export function locationAvailable() { return isNative || Boolean(navigator.geolocation); }

function locationError(error: unknown): LocationError {
  const value = error as { code?: string | number; message?: string };
  const code = typeof value?.code === 'number' ? value.code
    : ['OS-PLUG-GLOC-0003', 'OS-PLUG-GLOC-0009'].includes(String(value?.code)) ? 1
      : value?.code === 'OS-PLUG-GLOC-0010' ? 3 : 2;
  return { code, message: value?.message || '위치를 확인할 수 없습니다.' };
}

async function ensurePermission() {
  let permission = await Geolocation.checkPermissions();
  if (permission.location !== 'granted') permission = await Geolocation.requestPermissions({ permissions: ['location'] });
  if (permission.location !== 'granted') throw { code: 1, message: '정확한 위치 권한이 필요합니다.' };
}

export function getCurrentLocation(success: Success, failure: Failure, options: PositionOptions) {
  if (!isNative) { navigator.geolocation.getCurrentPosition(success, failure, options); return; }
  void ensurePermission().then(() => Geolocation.getCurrentPosition(options)).then(success).catch(error => failure(locationError(error)));
}

// Returning a disposer also handles pause/unmount while native permission or watch creation is pending.
export function watchLocation(success: Success, failure: Failure, options: PositionOptions): () => void {
  if (!isNative) {
    const id = navigator.geolocation.watchPosition(success, failure, options);
    return () => navigator.geolocation.clearWatch(id);
  }
  let stopped = false;
  let id: string | undefined;
  void ensurePermission().then(async () => {
    if (stopped) return;
    const next = await Geolocation.watchPosition({ ...options, interval: 3000, minimumUpdateInterval: 2000 }, (position, error) => {
      if (stopped) return;
      if (error) failure(locationError(error));
      else if (position) success(position);
    });
    id = next;
    if (stopped) await Geolocation.clearWatch({ id: next });
  }).catch(error => { if (!stopped) failure(locationError(error)); });
  return () => { stopped = true; if (id) void Geolocation.clearWatch({ id }).catch(() => {}); };
}
