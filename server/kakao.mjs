import { randomUUID } from 'node:crypto';
import { meters, validPoint, validateRequest, RoutingError } from './routing.mjs';

const fail = () => { throw new RoutingError('NO_ROUTE', 422); };

export function parseWalkingRoute(body, start, end) {
  if (body?.status !== 'OK') fail();
  const route = body.route;
  const distanceMeters = route?.properties?.totalDistance;
  if (!Number.isFinite(distanceMeters) || distanceMeters < 20 || distanceMeters > 50_000
    || !Array.isArray(route?.legs) || !route.legs.length || route.legs.length > 1000) fail();
  const points = [];
  const instructions = [];
  for (const leg of route.legs) {
    if (!Array.isArray(leg?.steps) || !leg.steps.length || leg.steps.length > 1000) fail();
    for (const step of leg.steps) {
      const raw = step?.path?.points;
      if (!Array.isArray(raw) || !raw.length || raw.length > 10_000) fail();
      const line = raw.map(coordinate => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) fail();
        const p = { longitude: coordinate[0], latitude: coordinate[1] };
        if (!validPoint(p)) fail();
        return p;
      });
      // Join actual path steps in order; do not bridge a gap with an invented road.
      if (points.length && meters(points.at(-1), line[0]) > 15) fail();
      for (const p of line) {
        const previous = points.at(-1);
        if (!previous || p.latitude !== previous.latitude || p.longitude !== previous.longitude) points.push(p);
      }
      const guidance = step.properties?.guidance;
      if (typeof guidance === 'string' && guidance.trim()) {
        instructions.push({ point: line[0], description: guidance.trim().slice(0, 500) });
      }
      if (points.length > 10_000 || instructions.length > 1000) fail();
    }
  }
  if (points.length < 2 || meters(points[0], start) > 150 || meters(points.at(-1), end) > 150) fail();
  return { id: randomUUID(), source: 'kakao-walk', name: `${start.label} → ${end.label}`,
    start, end, points, distanceMeters, instructions, createdAt: Date.now() };
}

export function createKakaoRouter({ key, fetchImpl = fetch }) {
  const restKey = key?.trim();
  async function json(url) {
    let response;
    try {
      response = await fetchImpl(url, { method: 'GET',
        headers: { Accept: 'application/json', Authorization: `KakaoAK ${restKey}` }, signal: AbortSignal.timeout(15_000) });
    } catch { throw new RoutingError('UPSTREAM_ERROR', 502); }
    if (!response.ok) {
      if (response.status === 429) throw new RoutingError('RATE_LIMITED', 429);
      if ([401, 403].includes(response.status)) throw new RoutingError('SERVICE_UNAVAILABLE', 503);
      throw new RoutingError('UPSTREAM_ERROR', 502);
    }
    try { return await response.json(); } catch { throw new RoutingError('UPSTREAM_ERROR', 502); }
  }
  async function busan(p) {
    const query = new URLSearchParams({ x: String(p.longitude), y: String(p.latitude), input_coord: 'WGS84' });
    const result = await json(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?${query}`);
    if (!Array.isArray(result?.documents)) throw new RoutingError('UPSTREAM_ERROR', 502);
    const region = result.documents.find(item => item?.region_type === 'B')
      ?? result.documents.find(item => item?.region_type === 'H');
    const name = region?.region_1depth_name;
    if (typeof name !== 'string' || !name.trim()) throw new RoutingError('UPSTREAM_ERROR', 502);
    if (name.trim() !== '부산광역시') throw new RoutingError('OUTSIDE_BUSAN', 422);
  }
  return async body => {
    const { start, end } = validateRequest(body);
    if (!restKey || restKey.startsWith('YOUR_')) throw new RoutingError('SERVICE_UNAVAILABLE', 503);
    await Promise.all([busan(start), busan(end)]);
    const query = new URLSearchParams({ start_x: String(start.longitude), start_y: String(start.latitude),
      end_x: String(end.longitude), end_y: String(end.latitude), s_name: start.label, e_name: end.label,
      input_coord: 'WGS84', output_coord: 'WGS84', route_mode: 'BROAD_FIRST' });
    return parseWalkingRoute(await json(`https://dapi.kakao.com/v2/routing/walk?${query}`), start, end);
  };
}
