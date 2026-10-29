// Only the SDK surface used by this app; no additional runtime dependency.
interface LatLng { getLat(): number; getLng(): number }
interface Bounds { extend(point: LatLng): void }
export interface MapInstance {
  setDraggable(draggable: boolean): void;
  setZoomable(zoomable: boolean): void;
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
export interface RegionInfo {
  region_type: 'B' | 'H';
  code: string;
  address_name: string;
  region_1depth_name: string;
}
interface SearchResult { place_name?: string; address_name: string; road_address_name?: string; x: string; y: string }
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => LatLng;
  LatLngBounds: new () => Bounds;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number }) => MapInstance;
  Marker: new (options: { map: MapInstance; position: LatLng; title: string }) => MapOverlay;
  Circle: new (options: { map: MapInstance; center: LatLng; radius: number; strokeWeight: number; strokeColor: string; strokeOpacity: number; fillColor: string; fillOpacity: number }) => MapOverlay;
  Polyline: new (options: { map: MapInstance; path: LatLng[]; strokeWeight: number; strokeColor: string; strokeOpacity: number }) => MapOverlay;
  services: {
    Places: new () => {
      keywordSearch(query: string, callback: (result: SearchResult[], status: string) => void,
        options: { size: number; location: LatLng }): void;
    };
    Geocoder: new () => {
      addressSearch(query: string, callback: (result: SearchResult[], status: string) => void, options: { size: number }): void;
      coord2Address(longitude: number, latitude: number, callback: (result: AddressResult[], status: string) => void): void;
      coord2RegionCode(longitude: number, latitude: number, callback: (result: RegionInfo[], status: string) => void): void;
    };
    Status: { OK: string; ZERO_RESULT?: string };
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

export async function lookupRegion(latitude: number, longitude: number): Promise<RegionInfo | null> {
  const sdk = await loadKakaoMaps();
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (value: RegionInfo | null, error?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (error) reject(error); else resolve(value);
    };
    const timer = window.setTimeout(() => finish(null, new Error('Region lookup timed out')), 12000);
    try {
      new sdk.services.Geocoder().coord2RegionCode(longitude, latitude, (results, status) => {
        if (status !== sdk.services.Status.OK) {
          finish(null, new Error('Region lookup failed'));
          return;
        }
        // Prefer legal districts; display names are not parsed to infer the province.
        const region = results.find(item => item.region_type === 'B')
          ?? results.find(item => item.region_type === 'H');
        finish(region?.region_1depth_name?.trim() ? region : null);
      });
    } catch (error) { finish(null, error instanceof Error ? error : new Error('Region lookup failed')); }
  });
}

export interface PlaceChoice { label: string; address: string; latitude: number; longitude: number }
export async function searchPlaces(query: string): Promise<PlaceChoice[]> {
  const text = query.trim();
  if (text.length < 2 || text.length > 100) return [];
  const sdk = await loadKakaoMaps();
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = window.setTimeout(() => finish([], new Error('Place search timed out')), 12000);
    const finish = (results: SearchResult[], error?: Error) => {
      if (done) return;
      done = true; clearTimeout(timer);
      if (error) { reject(error); return; }
      resolve(results.map(item => ({ label: item.place_name || item.address_name,
        address: item.road_address_name || item.address_name, latitude: Number(item.y), longitude: Number(item.x) }))
        .filter(item => item.label && Number.isFinite(item.latitude) && Math.abs(item.latitude) <= 90
          && Number.isFinite(item.longitude) && Math.abs(item.longitude) <= 180));
    };
    try {
      new sdk.services.Places().keywordSearch(text, (results, status) => {
        if (status === sdk.services.Status.OK && results.length) { finish(results); return; }
        if (status !== sdk.services.Status.ZERO_RESULT && status !== sdk.services.Status.OK) { finish([], new Error('Place search failed')); return; }
        try {
          new sdk.services.Geocoder().addressSearch(text, (addresses, addressStatus) => {
            if (addressStatus === sdk.services.Status.OK || addressStatus === sdk.services.Status.ZERO_RESULT) finish(addresses);
            else finish([], new Error('Address search failed'));
          }, { size: 5 });
        } catch { finish([], new Error('Address search failed')); }
      }, { size: 5, location: new sdk.LatLng(35.1796, 129.0756) });
    } catch { finish([], new Error('Place search failed')); }
  });
}
