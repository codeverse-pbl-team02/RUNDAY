import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const data = JSON.parse(readFileSync(new URL('../src/data/gwangan-dangdang-route.json', import.meta.url), 'utf8'));
const route = data.coordinates.map(([latitude, longitude]) => ({ latitude, longitude }));
const seagullData = JSON.parse(readFileSync(new URL('../src/data/gwangan-seagull-route.json', import.meta.url), 'utf8'));
const seagullRoute = seagullData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude }));
const yachtData = JSON.parse(readFileSync(new URL('../src/data/seomyeon-yacht-route.json', import.meta.url), 'utf8'));
const yachtRoute = yachtData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude }));
const snailData = JSON.parse(readFileSync(new URL('../src/data/haeundae-snail-route.json', import.meta.url), 'utf8'));
const snailRoute = snailData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude }));
const source = readFileSync(new URL('../src/running/routeProgress.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const context = { exports: {} };
vm.runInNewContext(outputText, context);
const { measureRouteProgress } = context.exports;

test('imported GPX keeps the complete approximately 4 km closed loop', () => {
  assert.equal(route.length, 257);
  assert.equal(data.reportedDistanceMeters, 4035);
  const progress = measureRouteProgress(route, []);
  assert.ok(progress.totalMeters > 4000 && progress.totalMeters < 4100);
  const start = route[0];
  const end = route.at(-1);
  assert.ok(Math.hypot((end.latitude - start.latitude) * 111320,
    (end.longitude - start.longitude) * 111320 * Math.cos(start.latitude * Math.PI / 180)) < 3);
});

test('progress follows GPX order and colors the course through sparse valid samples', () => {
  const samples = route.filter((_, index) => index % 3 === 0);
  samples.push(route.at(-1));
  const progress = measureRouteProgress(route, samples);
  assert.ok(progress.completedMeters >= progress.totalMeters - 10);
  assert.ok(progress.completedPath.length > 2);
});

test('a runner away from the start does not mark the GPX completed', () => {
  const away = route.slice(60, 70);
  const progress = measureRouteProgress(route, away);
  assert.equal(progress.completedMeters, 0);
  assert.equal(progress.completedPath.length, 0);
});

test('seagull GPX is a distinct, closed 4.1 km course', () => {
  assert.equal(seagullRoute.length, 273);
  assert.equal(seagullData.reportedDistanceMeters, 4121);
  assert.notDeepEqual(seagullRoute[0], route[0]);
  const progress = measureRouteProgress(seagullRoute, []);
  assert.ok(progress.totalMeters > 4100 && progress.totalMeters < 4200);
  const start = seagullRoute[0];
  const end = seagullRoute.at(-1);
  assert.ok(Math.hypot((end.latitude - start.latitude) * 111320,
    (end.longitude - start.longitude) * 111320 * Math.cos(start.latitude * Math.PI / 180)) < 3);
});

test('seagull GPX progress can reach the finish without jumping to the dog course', () => {
  const samples = seagullRoute.filter((_, index) => index % 3 === 0);
  samples.push(seagullRoute.at(-1));
  const progress = measureRouteProgress(seagullRoute, samples);
  assert.ok(progress.completedMeters >= progress.totalMeters - 10);
  assert.equal(measureRouteProgress(seagullRoute, route.slice(0, 10)).completedMeters, 0);
});

test('Seomyeon yacht GPX is a distinct, closed 5.98 km course', () => {
  assert.equal(yachtRoute.length, 355);
  assert.equal(yachtData.reportedDistanceMeters, 5984);
  assert.notDeepEqual(yachtRoute[0], route[0]);
  const progress = measureRouteProgress(yachtRoute, []);
  assert.ok(Math.abs(progress.totalMeters - yachtData.reportedDistanceMeters) < 30);
  const start = yachtRoute[0];
  const end = yachtRoute.at(-1);
  assert.ok(Math.hypot((end.latitude - start.latitude) * 111320,
    (end.longitude - start.longitude) * 111320 * Math.cos(start.latitude * Math.PI / 180)) < 3);
});

test('Seomyeon yacht progress follows the supplied course in order', () => {
  for (const step of [1, 2, 3]) {
    const samples = yachtRoute.filter((_, index) => index % step === 0);
    samples.push(yachtRoute.at(-1));
    const progress = measureRouteProgress(yachtRoute, samples);
    assert.ok(progress.completedMeters >= progress.totalMeters - 10,
      `step ${step}: ${progress.completedMeters.toFixed(0)} / ${progress.totalMeters.toFixed(0)} m`);
  }
  assert.equal(measureRouteProgress(yachtRoute, route.slice(0, 10)).completedMeters, 0);
});

test('Haeundae snail GPX is an 11.4 km point-to-point route', () => {
  assert.equal(snailRoute.length, 752);
  assert.equal(snailData.reportedDistanceMeters, 11393);
  const progress = measureRouteProgress(snailRoute, []);
  assert.ok(Math.abs(progress.totalMeters - snailData.reportedDistanceMeters) < 30);
  const start = snailRoute[0];
  const end = snailRoute.at(-1);
  assert.ok(Math.hypot((end.latitude - start.latitude) * 111320,
    (end.longitude - start.longitude) * 111320 * Math.cos(start.latitude * Math.PI / 180)) > 500);
});

test('Haeundae snail GPX guidance reaches the finish in route order', () => {
  for (const step of [1, 2, 3]) {
    const samples = snailRoute.filter((_, index) => index % step === 0);
    samples.push(snailRoute.at(-1));
    const progress = measureRouteProgress(snailRoute, samples);
    assert.ok(progress.completedMeters >= progress.totalMeters - 10,
      `step ${step}: ${progress.completedMeters.toFixed(0)} / ${progress.totalMeters.toFixed(0)} m`);
  }
  assert.equal(measureRouteProgress(snailRoute, route.slice(0, 10)).completedMeters, 0);
});
