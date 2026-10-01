// Only the SDK surface used by this app; no additional runtime dependency.
interface LatLng { getLat(): number; getLng(): number }
interface Bounds { extend(point: LatLng): void }
export interface MapInstance {
  setCenter(point: LatLng): void;
  getCenter(): LatLng;
  setBounds(bounds: Bounds, top?: number, right?: number, bottom?: number, left?: number): void;
  relayout(): void;
}
export interface MapOverlay { setMap(map: MapInstance | null): void }
interface AddressResult {
  road_address?: { address_name: string } | null;
  address?: { address_name: string } | null;
}
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => LatLng;
  LatLngBounds: new () => Bounds;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number }) => MapInstance;
  Marker: new (options: { map: MapInstance; position: LatLng; title: string }) => MapOverlay;
  Circle: new (options: { map: MapInstance; center: LatLng; radius: number; strokeWeight: number; strokeColor: string; strokeOpacity: number; fillColor: string; fillOpacity: number }) => MapOverlay;
  Polyline: new (options: { map: MapInstance; path: LatLng[]; strokeWeight: number; strokeColor: string; strokeOpacity: number }) => MapOverlay;
  services: {
    Geocoder: new () => {
      coord2Address(longitude: number, latitude: number, callback: (result: AddressResult[], status: string) => void): void;
    };
    Status: { OK: string };
  };
}
declare global { interface Window { kakao?: { maps: KakaoMaps } } }

const key = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim();
export const kakaoMapConfigured = Boolean(key && !key.startsWith('YOUR_'));
let pending: Promise<KakaoMaps> | null = null;

export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (!kakaoMapConfigured) return Promise.reject(new Error('Kakao Maps key is not configured'));
  if (pending) return pending;
  pending = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.onload = script.onerror = null;
      script.remove();
      reject(new Error('Kakao Maps could not be loaded'));
    };
    const timer = window.setTimeout(fail, 15000);
    const ready = () => {
      try {
        if (!window.kakao?.maps) { fail(); return; }
        window.kakao.maps.load(() => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          script.onload = script.onerror = null;
          resolve(window.kakao!.maps);
        });
      } catch { fail(); }
    };
    if (window.kakao?.maps) { ready(); return; }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key!)}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = ready;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => {
    pending = null;
    throw error;
  });
  return pending;
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const sdk = await loadKakaoMaps();
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error('Address lookup timed out'));
    }, 12000);
    const finish = (value: string | null, error?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(value);
    };
    try {
      const geocoder = new sdk.services.Geocoder();
      geocoder.coord2Address(longitude, latitude, (result, status) => {
        if (status !== sdk.services.Status.OK) { finish(null, new Error('Address lookup failed')); return; }
        finish(result[0]?.road_address?.address_name || result[0]?.address?.address_name || null);
      });
    } catch (error) { finish(null, error instanceof Error ? error : new Error('Address lookup failed')); }
  });
}
