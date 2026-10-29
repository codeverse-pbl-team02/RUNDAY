import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const cache = new Map();
const stubs = {
  'src/lib/assets.ts': { brandLogo: '/assets/9065b.png' },
  'src/auth/AuthProvider.tsx': { useAuth: () => ({ user: { uid: 'test' }, profile: { dataVersion: 2 } }) },
  'src/running/ActivityProvider.tsx': { useActivity: () => ({ runs: [], totalDistanceMeters: 0, badgeCount: 0 }) },
  'src/running/RunProvider.tsx': { useRun: () => ({ mode: 'idle', locating: false, current: null, locate() {} }) },
  'src/running/RunScreens.tsx': { LocationCard: () => null },
  'src/running/WeeklyRunChart.tsx': { WeeklyRunChart: () => null },
  'src/components/KakaoMap.tsx': { KakaoMap: () => null },
  'src/location/ServiceAreaProvider.tsx': { useServiceArea: () => ({ status: 'idle', message: '', canRecommendNearby: false }) },
  'src/platform/native.ts': { openPrivacyPolicy() {} },
};

function load(relative) {
  const file = path.resolve(root, relative);
  const key = path.relative(root, file).replaceAll('\\', '/');
  if (stubs[key]) return stubs[key];
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return require(file);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } });
  const module = { exports: {} };
  cache.set(file, module.exports);
  vm.runInNewContext(outputText, { exports: module.exports, module, require(name) {
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file), name);
    const target = [base, base + '.ts', base + '.tsx'].find(candidate => existsSync(candidate));
    assert.ok(target, `Missing dependency ${name}`);
    return load(target);
  } }, { filename: file });
  return module.exports;
}

const catalog = load('src/data/courses.ts');
const { courses, getCourse, getRecommendableCourses, formatCourseDistance,
  formatCourseDuration, formatCourseCalories, estimateRunningMinutes } = catalog;
const { getCourseGuide } = load('src/running/courseGuide.ts');

test('every catalog ID is unique and course coordinates, numbers, and local assets are usable', () => {
  assert.equal(courses.length, 5);
  assert.equal(new Set(courses.map(course => course.id)).size, courses.length);
  for (const course of courses) {
    assert.ok(Number.isSafeInteger(course.id) && course.id > 0);
    assert.ok(course.title && course.district && course.region === '부산광역시');
    for (const value of [course.distanceMeters, course.estimatedDurationMinutes, course.estimatedCaloriesKcal]) {
      assert.ok(Number.isFinite(value) && value > 0);
    }
    for (const asset of [course.image, course.mapImage]) assert.ok(existsSync(path.join(root, 'public', asset)));
    for (const point of course.route?.points ?? []) {
      assert.ok(Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90);
      assert.ok(Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180);
    }
  }
});

test('GPX distances, starts, point counts, and shapes agree with the original imported tracks', () => {
  const files = ['gwangan-dangdang', 'gwangan-seagull', 'haeundae-snail', 'seomyeon-yacht'];
  for (const [index, file] of files.entries()) {
    const data = require(path.join(root, `src/data/${file}-route.json`));
    const course = getCourse(index + 1);
    assert.equal(course.distanceMeters, data.reportedDistanceMeters);
    assert.equal(course.route.points.length, data.coordinates.length);
    assert.equal(course.startPoint.latitude, data.coordinates[0][0]);
    assert.equal(course.startPoint.longitude, data.coordinates[0][1]);
    assert.equal(course.route.shape, index === 2 ? 'point-to-point' : 'loop');
    const guide = getCourseGuide(course.id);
    assert.equal(guide.name, course.title);
    assert.equal(guide.referenceImage, course.mapImage);
    assert.equal(guide.points, course.route.points);
  }
});

test('a course without GPS remains browsable but is excluded from recommendations and guidance', () => {
  const course = getCourse(5);
  assert.ok(course);
  assert.equal(course.route, null);
  assert.equal(course.startPoint, null);
  assert.equal(course.recommendationEligible, false);
  assert.equal(getCourseGuide(5), null);
  assert.deepEqual(Array.from(getRecommendableCourses(), course => course.id), [1, 2, 3, 4]);
  assert.ok(getRecommendableCourses().includes(catalog.featuredCourse));
});

test('unknown IDs never silently resolve to a different course', () => {
  for (const id of [undefined, 0, -1, 999, NaN]) {
    assert.equal(getCourse(id), null);
    assert.equal(getCourseGuide(id), null);
  }
});

test('display units and optional pace estimates use numeric data without changing catalog times', () => {
  assert.equal(formatCourseDistance(getCourse(1)), '4.04km');
  assert.equal(formatCourseDistance(getCourse(2)), '4.12km');
  assert.equal(formatCourseDuration(getCourse(3)), '약 3시간 11분');
  assert.equal(formatCourseCalories(getCourse(4)), '약 327kcal');
  assert.equal(estimateRunningMinutes(getCourse(1), 7), 29);
  assert.equal(getCourse(1).estimatedDurationMinutes, 26);
  for (const pace of [0, -1, NaN, Infinity]) assert.equal(estimateRunningMinutes(getCourse(1), pace), null);
});

test('list, detail, and home display the common catalog; missing and invalid routes cannot start', () => {
  const List = load('src/screens/CourseListScreen.tsx').default;
  const Detail = load('src/screens/CourseDetailScreen.tsx').default;
  const Home = load('src/screens/HomeScreen.tsx').default;
  const noop = () => {};
  const list = renderToStaticMarkup(React.createElement(List, { onNavigate: noop, onSelectCourse: noop }));
  for (const course of courses) {
    const detail = renderToStaticMarkup(React.createElement(Detail, { courseId: course.id, onNavigate: noop, onStartCourse: noop }));
    for (const html of [list, detail]) {
      assert.ok(html.includes(course.title));
      assert.ok(html.includes(formatCourseDistance(course)));
      assert.ok(html.includes(formatCourseDuration(course)));
    }
    if (!course.route) assert.match(detail, /<button[^>]*disabled=""[^>]*>GPS 경로 준비 중<\/button>/);
  }
  const invalid = renderToStaticMarkup(React.createElement(Detail, { courseId: 999, onNavigate: noop, onStartCourse: noop }));
  assert.ok(invalid.includes('선택한 코스를 찾을 수 없습니다.'));
  assert.ok(!invalid.includes('러닝 시작'));
  const home = renderToStaticMarkup(React.createElement(Home, { onNavigate: noop, onSelectCourse: noop, onStartFreeRun: noop }));
  assert.ok(home.includes(catalog.featuredCourse.title));
});
