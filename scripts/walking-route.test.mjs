import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function load(file, imports = {}, globals = {}, replace = source => source) {
  const { outputText } = ts.transpileModule(replace(readFileSync(new URL(file, import.meta.url), 'utf8')), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: name => name in imports ? imports[name] : require(name), ...globals });
  return exports;
}
const types = load('../src/routing/types.ts');
const planned = () => ({
  id: 'route-test', source: 'kakao-walk', name: '출발지 → 도착지',
  start: { label: '출발지', latitude: 35.15, longitude: 129.13 },
  end: { label: '도착지', latitude: 35.153, longitude: 129.134 },
  points: [{ latitude: 35.15, longitude: 129.13 }, { latitude: 35.151, longitude: 129.131 }, { latitude: 35.153, longitude: 129.134 }],
  distanceMeters: 650, instructions: [], createdAt: Date.now(), paceSecondsPerKm: 420,
});

test('pace parsing rejects partial or invalid values and estimates running time from route distance', () => {
  assert.equal(types.parsePace('7', '30'), 450);
  assert.equal(types.estimatedRunSeconds(3200, 420), 1344);
  for (const [m, s] of [['', '0'], ['7.5', '0'], ['7', '60'], ['1', '59'], ['30', '1'], ['NaN', '0']]) {
    assert.equal(types.parsePace(m, s), null);
  }
});

test('only valid pedestrian responses can become planned running routes', () => {
  assert.equal(types.validPlannedRoute(planned()), true);
  for (const bad of [null, {}, { ...planned(), source: 'car' }, { ...planned(), points: [] },
    { ...planned(), points: [{ latitude: NaN, longitude: 129 }, null] }, { ...planned(), instructions: [null] },
    { ...planned(), paceSecondsPerKm: 0 }, { ...planned(), distanceMeters: -1 }]) {
    assert.equal(types.validPlannedRoute(bad), false);
  }
});

function client({ url = 'https://routing.example/api/walking-route', response = planned(), status = 200 } = {}) {
  const calls = [];
  const module = load('../src/routing/client.ts', {
    '../lib/firebase': { getFirebase: () => ({ auth: { currentUser: { getIdToken: async () => 'test-user-token' } } }) },
    '../platform/native': { isNative: true }, './types': types,
  }, { URL, DOMException, fetch: async (address, options) => {
    calls.push({ address, options }); return { ok: status === 200, status, json: async () => response };
  } }, source => source.replace('import.meta.env.VITE_ROUTING_API_URL', JSON.stringify(url)).replace('import.meta.env.DEV', 'false'));
  return { ...module, calls };
}

test('routing client sends authenticated endpoint coordinates and validates the response', async () => {
  const api = client(); const input = planned();
  const result = await api.requestWalkingRoute(input.start, input.end, new AbortController().signal);
  assert.equal(result.source, 'kakao-walk');
  assert.equal(api.calls[0].options.headers.Authorization, 'Bearer test-user-token');
  assert.deepEqual(JSON.parse(api.calls[0].options.body), { start: input.start, end: input.end });
  assert.ok(!api.calls[0].options.body.includes('test-user-token'));
});

test('client rejects misconfigured endpoints, failed service, and a response for different endpoints', async () => {
  const input = planned();
  const signal = new AbortController().signal;
  for (const url of ['', 'http://remote.example/api/walking-route', 'javascript:bad']) {
    const api = client({ url });
    assert.equal(api.routingConfigured, false);
    await assert.rejects(api.requestWalkingRoute(input.start, input.end, signal), /준비 중/);
    assert.equal(api.calls.length, 0);
  }
  const outside = client({ status: 422, response: { code: 'OUTSIDE_BUSAN' } });
  await assert.rejects(outside.requestWalkingRoute(input.start, input.end, signal), /부산 내/);
  const mismatch = client({ response: { ...input, end: { ...input.end, latitude: 35.16 } } });
  await assert.rejects(mismatch.requestWalkingRoute(input.start, input.end, signal), /경로 정보/);
});

function hooks({ skipEffects = false } = {}) {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const react = {
    createContext: () => ({ Provider: 'ContextProvider' }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(effect, deps) {
      const index = cursor++;
      if (skipEffects) return;
      const previous = slots[index];
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: effect() }; });
    },
  };
  return { react, render(fn) { cursor = 0; const result = fn(); while (effects.length) effects.shift()(); return result; },
    dispose() { for (const slot of slots) slot?.cleanup?.(); } };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const found = find(child, predicate); if (found) return found;
  }
}
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  const children = node.props?.children;
  return (Array.isArray(children) ? children.flat(Infinity) : [children]).map(text).join('');
}

test('planner renders input controls and never offers Start before a real route exists', () => {
  const run = { mode: 'idle', session: {}, current: null, accuracy: null, locating: false, locate() {} };
  const { default: Planner } = load('../src/screens/RoutePlannerScreen.tsx', {
    '../running/RunProvider': { useRun: () => run, clockText: () => '00:00:00' },
    '../location/ServiceAreaProvider': { useServiceArea: () => ({ canRecommendNearby: false }) },
    '../location/serviceArea': { locationIssue: () => null },
    '../components/PlaceSearchField': { PlaceSearchField: ({ label }) => React.createElement('label', null, label) },
    '../components/KakaoMap': { KakaoMap: () => null },
    '../routing/client': { routingConfigured: false }, '../routing/types': types,
  });
  const html = renderToStaticMarkup(React.createElement(Planner, { onBack() {}, onStart() { return false; }, onOpenRunning() {} }));
  assert.ok(html.includes('러닝 경로 찾기'));
  assert.ok(html.includes('도착지'));
  assert.ok(html.includes('경로 찾기 서비스를 준비 중'));
  assert.ok(!html.includes('이 경로로 러닝 시작'));
});

function plannerHarness(requestWalkingRoute = async () => planned()) {
  const runtime = hooks();
  const starts = [];
  const run = { mode: 'idle', saved: false, session: { plannedRoute: planned() }, current: null, accuracy: null };
  const props = { onBack() {}, onStart(route) { starts.push(route); return true; }, onOpenRunning() {} };
  const { default: Planner } = load('../src/screens/RoutePlannerScreen.tsx', {
    react: runtime.react,
    '../running/RunProvider': { useRun: () => run, clockText: seconds => String(seconds) },
    '../location/ServiceAreaProvider': { useServiceArea: () => ({ canRecommendNearby: true }) },
    '../location/serviceArea': { locationIssue: () => null },
    '../components/PlaceSearchField': { PlaceSearchField: 'PlaceSearchField' },
    '../components/KakaoMap': { KakaoMap: 'Map' },
    '../routing/client': { routingConfigured: true, requestWalkingRoute }, '../routing/types': types,
  }, { AbortController, window: { setTimeout }, clearTimeout });
  return { run, starts, render: () => runtime.render(() => Planner(props)), dispose: runtime.dispose };
}

test('pace changes update duration without refetching geometry, and Start passes the chosen route and pace', () => {
  let calls = 0;
  const app = plannerHarness(async () => { calls++; return planned(); });
  let tree = app.render();
  find(tree, node => node.props?.['aria-label'] === '페이스 분').props.onChange({ target: { value: '8' } });
  tree = app.render();
  assert.ok(text(tree).includes('예상 312'));
  find(tree, node => node.type === 'button' && node.props.children === '이 경로로 러닝 시작').props.onClick();
  assert.equal(app.starts[0].paceSecondsPerKm, 480);
  assert.deepEqual(app.starts[0].points, planned().points);
  assert.equal(calls, 0);
  app.dispose();
});

test('editing an endpoint hides old results and a late response cannot enable Start', async () => {
  let resolve;
  const app = plannerHarness(() => new Promise(done => { resolve = done; }));
  let tree = app.render();
  find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  tree = app.render();
  find(tree, node => node.props?.label === '도착지').props.onChange({ ...planned().end, latitude: 35.16 });
  tree = app.render();
  assert.equal(find(tree, node => node.props?.['aria-label'] === '추천 경로 미리보기'), undefined);
  resolve(planned()); await Promise.resolve(); await Promise.resolve();
  assert.equal(find(app.render(), node => node.props?.['aria-label'] === '추천 경로 미리보기'), undefined);
  assert.equal(app.starts.length, 0);
  app.dispose();
});

test('planner prevents replacing an unfinished running session', () => {
  const app = plannerHarness(); app.run.mode = 'running';
  const tree = app.render();
  assert.ok(text(tree).includes('진행 중이거나 저장하지 않은 러닝'));
  const button = find(tree, node => node.type === 'button' && node.props.children === '이 경로로 러닝 시작');
  assert.equal(button.props.disabled, true);
  app.dispose();
});

function runHarness() {
  const runtime = hooks({ skipEffects: true });
  let position;
  let saved;
  const { RunProvider } = load('../src/running/RunProvider.tsx', {
    react: runtime.react,
    '../auth/AuthProvider': { useAuth: () => ({ user: { uid: 'test-user' } }) },
    '../lib/firebase': { getFirebase: () => ({ db: {} }) },
    '../auth/errors': { authError: () => '저장 실패' },
    '../platform/native': { isNative: false }, '@capacitor/app': {},
    './courseGuide': { getCourseGuide: id => id === 1 ? { points: [] } : null },
    '../routing/types': types,
    '../platform/location': { locationAvailable: () => true, watchLocation(callback) { position = callback; return () => {}; } },
    'firebase/firestore': { doc: () => ({}), serverTimestamp: () => 'server-time',
      runTransaction: async (_db, fn) => fn({ get: async () => ({ exists: () => false }), set(_ref, data) { saved = data; } }) },
  }, { window: { isSecureContext: true }, crypto: { randomUUID }, performance: { now: () => 1000 } });
  return { render: () => runtime.render(() => RunProvider({ children: null })).props.value,
    position: value => position(value), get saved() { return saved; } };
}

test('RunProvider retains the planned path while recording GPS and saving the existing record schema', async () => {
  const app = runHarness();
  let run = app.render();
  assert.equal(run.startRoute(planned()), true);
  run = app.render();
  assert.equal(run.mode, 'locating');
  assert.equal(run.session.plannedRoute.source, 'kakao-walk');
  const now = Date.now();
  app.position({ coords: { latitude: 35.15, longitude: 129.13, accuracy: 10 }, timestamp: now });
  app.position({ coords: { latitude: 35.1501, longitude: 129.13, accuracy: 10 }, timestamp: now + 3000 });
  run = app.render();
  assert.equal(run.mode, 'running');
  assert.equal(run.startRoute({ ...planned(), id: 'replacement' }), false);
  assert.equal(app.render().session.plannedRoute.id, 'route-test');
  run.finish(); run = app.render();
  assert.equal(await run.save(), true);
  assert.equal(app.saved.points.length, 2);
  assert.deepEqual(Object.keys(app.saved).sort(), ['createdAt', 'distanceMeters', 'durationSeconds', 'points', 'startedAt']);
  run = app.render(); run.reset();
  assert.equal(app.render().session.plannedRoute, undefined);
  assert.equal(app.render().start(), true);
  assert.equal(app.render().session.plannedRoute, undefined);
});

test('RunProvider rejects malformed route input without starting GPS', () => {
  const app = runHarness();
  assert.equal(app.render().startRoute({ ...planned(), points: [] }), false);
  assert.equal(app.render().mode, 'idle');
});
