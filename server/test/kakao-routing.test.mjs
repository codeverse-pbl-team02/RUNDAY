import assert from 'node:assert/strict';
import test from 'node:test';
import { createKakaoRouter, parseWalkingRoute } from '../kakao.mjs';
import { validateRequest } from '../routing.mjs';

const start = { label: '출발지', latitude: 35.15, longitude: 129.13 };
const end = { label: '도착지', latitude: 35.153, longitude: 129.134 };
const body = { start, end };
const step = points => ({ path: { points }, properties: {} });
const geometry = () => ({ status: 'OK', route: {
  properties: { totalDistance: 650, totalTime: 600 },
  legs: [{ steps: [
    { path: { points: [[129.13, 35.15], [129.131, 35.151]] }, properties: { guidance: '횡단보도를 건너 직진하세요.' } },
    step([[129.131, 35.151], [129.134, 35.153]]),
  ] }],
} });

test('Kakao route validates both provinces and requests WGS84 walking paths with a REST key', async () => {
  const calls = [];
  const route = createKakaoRouter({ key: 'test-only', async fetchImpl(url, options) {
    calls.push({ url, options });
    return { ok: true, async json() { return url.includes('coord2regioncode')
      ? { documents: [{ region_type: 'B', region_1depth_name: '부산광역시' }] } : geometry(); } };
  } });
  const result = await route(body);
  assert.equal(calls.length, 3);
  assert.equal(result.source, 'kakao-walk');
  assert.equal(result.distanceMeters, 650);
  assert.equal(result.points.length, 3);
  assert.deepEqual(result.points[1], { longitude: 129.131, latitude: 35.151 });
  assert.equal(result.instructions[0].description, '횡단보도를 건너 직진하세요.');
  const walk = calls.find(call => call.url.includes('/routing/walk?'));
  const query = new URL(walk.url).searchParams;
  assert.equal(query.get('start_x'), String(start.longitude));
  assert.equal(query.get('start_y'), String(start.latitude));
  assert.equal(query.get('end_x'), String(end.longitude));
  assert.equal(query.get('output_coord'), 'WGS84');
  assert.equal(query.get('route_mode'), 'BROAD_FIRST');
  assert.equal(query.get('s_name'), start.label);
  for (const call of calls) {
    assert.equal(call.options.method, 'GET');
    assert.equal(call.options.headers.Authorization, 'KakaoAK test-only');
    assert.ok(!call.url.includes('test-only'));
    assert.equal(new URL(call.url).hostname, 'dapi.kakao.com');
  }
  assert.ok(!JSON.stringify(result).includes('test-only'));
});

test('bad coordinates, identical points, and excessive distance are rejected', () => {
  for (const input of [null, { start, end: start }, { start: { ...start, latitude: NaN }, end },
    { start, end: { ...end, longitude: '129.13' } }, { start, end: { ...end, latitude: 37.56 } }]) {
    assert.throws(() => validateRequest(input), error => error.code === 'INVALID_REQUEST');
  }
});

test('missing REST key fails closed without falling back to a browser JavaScript key', async () => {
  const route = createKakaoRouter({ key: '', fetchImpl() { throw new Error('must not call'); } });
  await assert.rejects(route(body), error => error.code === 'SERVICE_UNAVAILABLE');
});

test('outside and unknown administrative regions cannot become a running route', async () => {
  for (const region of ['서울특별시', '울산광역시', '']) {
    let walkCalls = 0;
    const route = createKakaoRouter({ key: 'test-only', async fetchImpl(url) {
      if (url.includes('/routing/walk?')) walkCalls++;
      return { ok: true, async json() { return { documents: [{ region_type: 'B', region_1depth_name: region }] }; } };
    } });
    await assert.rejects(route(body), error => error.code === (region ? 'OUTSIDE_BUSAN' : 'UPSTREAM_ERROR'));
    assert.equal(walkCalls, 0);
  }
});

test('missing, disconnected, reversed, or malformed paths are never replaced with straight lines', () => {
  const disconnected = geometry();
  disconnected.route.legs[0].steps[1] = step([[129.14, 35.16], [129.134, 35.153]]);
  const reversed = geometry();
  reversed.route.legs[0].steps = [step([[129.134, 35.153], [129.13, 35.15]])];
  const invalid = geometry(); invalid.route.legs[0].steps[0].path.points[0][1] = NaN;
  const noDistance = geometry(); delete noDistance.route.properties.totalDistance;
  for (const response of [null, { status: 'OK', route: { legs: [] } }, disconnected, reversed, invalid, noDistance]) {
    assert.throws(() => parseWalkingRoute(response, start, end), error => error.code === 'NO_ROUTE');
  }
});

test('Kakao non-success statuses cannot enable route preview even when route-like data is present', () => {
  for (const status of ['SAME_POINT', 'START_LINK_NOT_FOUND', 'END_LINK_NOT_FOUND', 'TOO_MANY_SEARCH_LINK', 'TOO_FAR_AWAY', 'ROUTE_RESULT_NOT_FOUND', undefined]) {
    assert.throws(() => parseWalkingRoute({ ...geometry(), status }, start, end), error => error.code === 'NO_ROUTE');
  }
});

test('REST authentication errors and quota limits return actionable public codes without leaking provider details', async () => {
  for (const [status, code] of [[401, 'SERVICE_UNAVAILABLE'], [403, 'SERVICE_UNAVAILABLE'], [429, 'RATE_LIMITED'], [500, 'UPSTREAM_ERROR']]) {
    const route = createKakaoRouter({ key: 'test-only', fetchImpl: async () => ({ ok: false, status }) });
    await assert.rejects(route(body), error => error.code === code && !error.message.includes('test-only'));
  }
});
