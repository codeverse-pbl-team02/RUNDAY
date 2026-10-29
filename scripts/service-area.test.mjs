import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function load(file, imports = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(name) {
    return name in imports ? imports[name] : require(name);
  }, ...globals });
  return exports;
}
const policy = load('../src/location/serviceArea.ts');
const busan = { region_type: 'B', region_1depth_name: '부산광역시', address_name: '부산광역시 수영구 민락동' };
const seoul = { region_type: 'B', region_1depth_name: '서울특별시', address_name: '서울특별시 중구' };

function setup({ configured = true } = {}) {
  let now = 1_800_000_000_000;
  let cursor = 0;
  let timerId = 0;
  const slots = [];
  const effects = [];
  const timers = new Map();
  const requests = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: effect() }; });
    },
  };
  const lookup = (latitude, longitude) => new Promise((resolve, reject) => requests.push({ latitude, longitude, resolve, reject }));
  const hooks = load('../src/location/useServiceAreaState.ts', {
    react, '../lib/kakaoMap': { kakaoMapConfigured: configured, lookupRegion: lookup }, './serviceArea': policy,
  }, { Date: { now: () => now }, window: {
    setTimeout(fn, delay) { timers.set(++timerId, { fn, due: now + delay }); return timerId; },
  }, clearTimeout(id) { timers.delete(id); } });
  const input = { enabled: true, locating: false, locationError: null, accuracy: 10,
    point: { latitude: 35.15, longitude: 129.13, timestamp: now } };
  const render = () => {
    cursor = 0;
    const value = hooks.useServiceAreaState(input);
    while (effects.length) effects.shift()();
    return value;
  };
  return { input, requests, render,
    async advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) if (timer.due <= now) { timers.delete(id); timer.fn(); }
      await Promise.resolve(); await Promise.resolve();
    },
    dispose() { for (const slot of slots) slot?.cleanup?.(); },
  };
}

test('structured province determines Busan; address text and empty results do not', () => {
  assert.equal(policy.classifyRegion(busan).status, 'inside');
  assert.equal(policy.classifyRegion(busan).canRecommendNearby, true);
  assert.equal(policy.classifyRegion(seoul).status, 'outside');
  assert.equal(policy.classifyRegion({ ...seoul, address_name: '부산식당' }).status, 'outside');
  assert.equal(policy.classifyRegion(null).status, 'error');
  assert.equal(policy.classifyRegion({ address_name: '부산광역시' }).status, 'error');
});

test('invalid, inaccurate, old, and future GPS fixes are kept separate from outside service', () => {
  const now = Date.now();
  const point = { latitude: 35.15, longitude: 129.13, timestamp: now };
  assert.equal(policy.locationIssue(point, 10, now), null);
  for (const [fix, accuracy] of [
    [{ ...point, latitude: NaN }, 10], [{ ...point, latitude: 91 }, 10],
    [{ ...point, timestamp: now - policy.MAX_LOCATION_AGE_MS }, 10],
    [{ ...point, timestamp: now + 6000 }, 10], [point, null], [point, 101], [point, -1],
  ]) assert.ok(policy.locationIssue(fix, accuracy, now));
});

test('one resolved GPS lookup is shared across rerenders, with fresh identical-coordinate caching', async () => {
  const app = setup();
  assert.equal(app.render().status, 'checking');
  await app.advance(250);
  app.requests[0].resolve(busan); await app.advance(0);
  assert.equal(app.render().status, 'inside');
  app.render(); app.render();
  await app.advance(250);
  assert.equal(app.requests.length, 1);
  app.input.point = { ...app.input.point, timestamp: app.input.point.timestamp + 250 };
  app.render(); await app.advance(250);
  assert.equal(app.render().status, 'inside');
  assert.equal(app.requests.length, 1);
  app.dispose();
});

test('a new GPS fix hides the old outside notice and late responses cannot overwrite the new region', async () => {
  const app = setup(); app.render(); await app.advance(250);
  const old = app.requests[0];
  app.input.point = { ...app.input.point, latitude: 37.56, longitude: 126.97 };
  assert.equal(app.render().status, 'checking');
  await app.advance(250);
  app.requests[1].resolve(seoul); await app.advance(0);
  assert.equal(app.render().status, 'outside');
  old.resolve(busan); await app.advance(0);
  assert.equal(app.render().status, 'outside');
  app.input.point = { ...app.input.point, latitude: 35.16 };
  assert.equal(app.render().status, 'checking');
  app.dispose();
});

test('refresh and permission errors override a previously confirmed outside region', async () => {
  const app = setup(); app.render(); await app.advance(250);
  app.requests[0].resolve(seoul); await app.advance(0);
  assert.equal(app.render().status, 'outside');
  app.input.locating = true;
  assert.equal(app.render().status, 'locating');
  app.input.locating = false; app.input.locationError = '위치 권한이 차단되었습니다.';
  assert.equal(app.render().status, 'error');
  assert.equal(app.render().canRecommendNearby, false);
  app.dispose();
});

test('unknown region and network failure show retryable errors, never outside notices', async () => {
  for (const failure of ['empty', 'network']) {
    const app = setup(); app.render(); await app.advance(250);
    if (failure === 'empty') app.requests[0].resolve(null); else app.requests[0].reject(new Error('offline'));
    await app.advance(0);
    assert.equal(app.render().status, 'error');
    assert.equal(app.render().canRecommendNearby, false);
    app.dispose();
  }
});

test('expired GPS stops eligibility and pending responses cannot restore it', async () => {
  const app = setup(); app.render(); await app.advance(250);
  const pending = app.requests[0];
  await app.advance(policy.MAX_LOCATION_AGE_MS);
  assert.equal(app.render().status, 'error');
  pending.resolve(busan); await app.advance(0);
  assert.equal(app.render().canRecommendNearby, false);
  app.dispose();
});

test('disabled screens, missing location, bad accuracy, and missing SDK configuration skip lookups', async () => {
  for (const kind of ['disabled', 'missing', 'accuracy', 'configuration']) {
    const app = setup({ configured: kind !== 'configuration' });
    if (kind === 'disabled') app.input.enabled = false;
    if (kind === 'missing') app.input.point = null;
    if (kind === 'accuracy') app.input.accuracy = 500;
    assert.notEqual(app.render().status, 'outside');
    await app.advance(500);
    assert.equal(app.requests.length, 0);
    app.dispose();
  }
});

test('outside notice keeps actual GPS map coordinates and offers a working course browse action', () => {
  const { ServiceAreaNotice } = load('../src/components/ServiceAreaNotice.tsx');
  const fix = { latitude: 37.56, longitude: 126.97, timestamp: Date.now() };
  let captured;
  let browsed = false;
  let state = policy.classifyRegion(seoul);
  const { CurrentLocationMap } = load('../src/components/CurrentLocationMap.tsx', {
    '../running/RunProvider': { useRun: () => ({ current: fix, accuracy: 10, locating: false }) },
    '../location/ServiceAreaProvider': { useServiceArea: () => state },
    './ServiceAreaNotice': { ServiceAreaNotice },
    './KakaoMap': { KakaoMap(props) { captured = props; return React.createElement('div', null, props.overlay); } },
  });
  const element = React.createElement(CurrentLocationMap, { onBrowseCourses: () => { browsed = true; } });
  const html = renderToStaticMarkup(element);
  assert.equal(captured.current, fix);
  assert.ok(html.includes('현재 부산 외 지역입니다.'));
  assert.ok(html.includes('자유 러닝은 이용할 수 있습니다.'));
  const notice = ServiceAreaNotice(captured.overlay.props);
  const children = notice.props.children[2].props.children;
  children.find(child => child.type === 'button').props.onClick();
  assert.equal(browsed, true);
  state = policy.classifyRegion(busan);
  assert.ok(!renderToStaticMarkup(element).includes('현재 부산 외 지역입니다.'));
  assert.equal(captured.overlay, undefined);
});
