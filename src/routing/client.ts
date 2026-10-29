import { getFirebase } from '../lib/firebase';
import { isNative } from '../platform/native';
import { validWalkingRoute, type RouteEndpoint, type WalkingRoute } from './types';

const requestedUrl = import.meta.env.VITE_ROUTING_API_URL?.trim();
const developmentProxy = import.meta.env.DEV && !isNative;
const configuredUrl = (() => {
  if (!requestedUrl) return null;
  try {
    const url = new URL(requestedUrl);
    return url.protocol === 'https:' || (developmentProxy && url.protocol === 'http:'
      && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) ? url.href : null;
  } catch { return null; }
})();
export const routingConfigured = Boolean(configuredUrl || (!requestedUrl && developmentProxy));

export async function requestWalkingRoute(start: RouteEndpoint, end: RouteEndpoint, signal: AbortSignal): Promise<WalkingRoute> {
  if (!routingConfigured) throw new Error('경로 찾기 서비스를 준비 중입니다. 잠시 후 다시 이용해 주세요.');
  const user = getFirebase().auth.currentUser;
  if (!user) throw new Error('로그인 후 다시 시도해 주세요.');
  const token = await user.getIdToken();
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  let response: Response;
  try {
    response = await fetch(configuredUrl || '/api/walking-route', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ start, end }), signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('경로를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.');
  }
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new Error('경로 찾기 서비스를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
  if (!response.ok) {
    const messages: Record<string, string> = {
      OUTSIDE_BUSAN: '부산 내 출발지와 도착지를 선택해 주세요.',
      INVALID_REQUEST: '출발지와 도착지를 확인해 주세요. 서로 다른 지점을 선택해야 합니다.',
      NO_ROUTE: '두 지점 사이의 보행 경로를 찾지 못했습니다. 다른 위치를 선택해 주세요.',
      SERVICE_UNAVAILABLE: '경로 찾기 서비스를 준비 중입니다. 잠시 후 다시 이용해 주세요.',
      RATE_LIMITED: '요청이 많습니다. 잠시 기다린 뒤 다시 시도해 주세요.',
      UNAUTHENTICATED: '로그인 상태를 확인하고 다시 시도해 주세요.',
    };
    const code = (body as { code?: string } | null)?.code;
    throw new Error(messages[code || ''] || '경로 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
  if (!validWalkingRoute(body) || body.start.latitude !== start.latitude || body.start.longitude !== start.longitude
    || body.end.latitude !== end.latitude || body.end.longitude !== end.longitude) {
    throw new Error('경로 정보를 확인하지 못했습니다. 다시 조회해 주세요.');
  }
  return body;
}
