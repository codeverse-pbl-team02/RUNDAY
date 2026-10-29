import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise SDK network lifecycle without real credentials or Kakao requests.
function setup(key = 'test-key') {
  const scripts = [];
  const timers = new Map();
  let timerId = 0;
  const window = { setTimeout(fn) { timers.set(++timerId, fn); return timerId; } };
  const context = { exports: {}, window, clearTimeout(id) { timers.delete(id); },
    document: {
      createElement() { return { remove() { this.removed = true; } }; },
      head: { appendChild(script) { scripts.push(script); } },
    },
  };
  const source = readFileSync(new URL('../src/lib/kakaoMap.ts', import.meta.url), 'utf8')
    .replace('import.meta.env.VITE_KAKAO_MAP_APP_KEY', JSON.stringify(key));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  vm.runInNewContext(outputText, context);
  return { ...context, scripts, timers, load: context.exports.loadKakaoMaps,
    reverse: context.exports.reverseGeocode, region: context.exports.lookupRegion, search: context.exports.searchPlaces };
}

test('missing key makes no network request', async () => {
  const env = setup('');
  await assert.rejects(env.load(), /not configured/);
  assert.equal(env.scripts.length, 0);
});

test('concurrent maps share a single SDK load and wait for SDK readiness', async () => {
  const env = setup();
  const first = env.load();
  const second = env.load();
  assert.equal(first, second);
  assert.equal(env.scripts.length, 1);
  let ready;
  const maps = { load(callback) { ready = callback; } };
  env.window.kakao = { maps };
  env.scripts[0].onload();
  ready();
  assert.equal(await first, maps);
  assert.equal(await env.load(), maps);
  assert.equal(env.timers.size, 0);
  assert.equal(env.scripts.length, 1);
});

test('network failure can be retried without a stale failed script', async () => {
  const env = setup();
  const failed = env.load();
  env.scripts[0].onerror();
  await assert.rejects(failed, /could not be loaded/);
  assert.equal(env.scripts[0].removed, true);
  const retry = env.load();
  assert.equal(env.scripts.length, 2);
  env.window.kakao = { maps: { load(callback) { callback(); } } };
  env.scripts[1].onload();
  await retry;
  assert.equal(env.timers.size, 0);
});

test('SDK timeout rejects, ignores late readiness, and allows retry', async () => {
  const env = setup();
  const failed = env.load();
  let lateReady;
  env.window.kakao = { maps: { load(callback) { lateReady = callback; } } };
  env.scripts[0].onload();
  [...env.timers.values()][0]();
  await assert.rejects(failed, /could not be loaded/);
  lateReady();
  env.window.kakao.maps.load = callback => callback();
  assert.equal(await env.load(), env.window.kakao.maps);
});

test('reverse geocoding sends longitude first and prefers a road address', async () => {
  const env = setup();
  let received;
  env.window.kakao = { maps: {
    load(callback) { callback(); },
    services: {
      Status: { OK: 'OK' },
      Geocoder: class {
        coord2Address(longitude, latitude, callback) {
          received = [longitude, latitude];
          callback([{ road_address: { address_name: '도로명 주소' }, address: { address_name: '지번 주소' } }], 'OK');
        }
      },
    },
  } };
  assert.equal(await env.reverse(35.11, 128.96), '도로명 주소');
  assert.deepEqual(received, [128.96, 35.11]);
  assert.equal(env.timers.size, 0);
});

test('region lookup sends longitude first and prefers the structured legal district', async () => {
  const env = setup();
  let received;
  env.window.kakao = { maps: {
    load(callback) { callback(); }, services: { Status: { OK: 'OK' }, Geocoder: class {
      coord2RegionCode(longitude, latitude, callback) {
        received = [longitude, latitude];
        callback([
          { region_type: 'H', region_1depth_name: '부산광역시', address_name: '행정동' },
          { region_type: 'B', region_1depth_name: '부산광역시', address_name: '법정동' },
        ], 'OK');
      }
    } },
  } };
  const region = await env.region(35.15, 129.13);
  assert.deepEqual(received, [129.13, 35.15]);
  assert.equal(region.address_name, '법정동');
  assert.equal(region.region_1depth_name, '부산광역시');
  assert.equal(env.timers.size, 0);
});

test('empty and incomplete region responses do not become an outside-service classification', async () => {
  for (const result of [[], [{ region_type: 'B', address_name: '부산이라고 적힌 장소' }]]) {
    const env = setup();
    env.window.kakao = { maps: { load(cb) { cb(); }, services: { Status: { OK: 'OK' },
      Geocoder: class { coord2RegionCode(_x, _y, cb) { cb(result, 'OK'); } },
    } } };
    assert.equal(await env.region(35.15, 129.13), null);
    assert.equal(env.timers.size, 0);
  }
});

test('region timeout rejects and ignores a late response', async () => {
  const env = setup();
  let respond;
  env.window.kakao = { maps: { load(cb) { cb(); }, services: { Status: { OK: 'OK' },
    Geocoder: class { coord2RegionCode(_x, _y, cb) { respond = cb; } },
  } } };
  const pending = env.region(35.15, 129.13);
  await env.load();
  await Promise.resolve();
  [...env.timers.values()][0]();
  await assert.rejects(pending, /timed out/);
  respond([{ region_type: 'B', region_1depth_name: '서울특별시' }], 'OK');
  assert.equal(env.timers.size, 0);
});

test('region service errors reject instead of assuming another region', async () => {
  const env = setup();
  env.window.kakao = { maps: { load(cb) { cb(); }, services: { Status: { OK: 'OK' },
    Geocoder: class { coord2RegionCode(_x, _y, cb) { cb([], 'ERROR'); } },
  } } };
  await assert.rejects(env.region(35.15, 129.13), /failed/);
  assert.equal(env.timers.size, 0);
});

test('place search returns selectable coordinates with a Busan search bias', async () => {
  const env = setup();
  let received;
  env.window.kakao = { maps: { load(cb) { cb(); }, LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } },
    services: { Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' }, Places: class {
      keywordSearch(query, cb, options) { received = { query, options };
        cb([{ place_name: '민락수변공원', address_name: '부산광역시 수영구', x: '129.13', y: '35.15' }], 'OK'); }
    } },
  } };
  const results = await env.search('민락수변공원');
  assert.equal(received.query, '민락수변공원');
  assert.equal(received.options.size, 5);
  assert.equal(results[0].latitude, 35.15);
  assert.equal(results[0].longitude, 129.13);
  assert.equal(env.timers.size, 0);
});

test('place search falls back to address search when no place matches', async () => {
  const env = setup();
  env.window.kakao = { maps: { load(cb) { cb(); }, LatLng: class {}, services: {
    Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
    Places: class { keywordSearch(_query, cb) { cb([], 'ZERO_RESULT'); } },
    Geocoder: class { addressSearch(query, cb) {
      assert.equal(query, '부산 수영로 576');
      cb([{ address_name: '부산 수영로 576', x: '129.12', y: '35.15' }], 'OK');
    } },
  } } };
  const results = await env.search('부산 수영로 576');
  assert.equal(results[0].label, '부산 수영로 576');
  assert.equal(env.timers.size, 0);
});
