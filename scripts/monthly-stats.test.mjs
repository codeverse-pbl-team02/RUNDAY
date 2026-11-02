import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/running/monthlyStats.ts', import.meta.url),'utf8');
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
const { monthlyStats } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const run = (year,month,day,km=1,minutes=10,hour=12) => ({startedAt:new Date(year,month,day,hour).getTime(),distanceMeters:km*1000,durationSeconds:minutes*60});

test('aggregates only the selected calendar month across year boundaries',()=>{
  const now=new Date(2026,0,5,13);
  const runs=[run(2025,11,31,3,20),run(2026,0,1,2,15),run(2026,0,5,4,30),run(2026,0,6,99,99)];
  const january=monthlyStats(runs,2026,0,now);
  assert.equal(january.distanceKm,6); assert.equal(january.count,2); assert.equal(january.minutes,45);
  assert.equal(monthlyStats(runs,2025,11,now).distanceKm,3);
  assert.equal(monthlyStats(runs,2026,1,now).count,0);
});
test('deduplicates active days and separates monthly longest from ongoing streak',()=>{
  const runs=[run(2026,10,1),run(2026,10,1),run(2026,10,2),run(2026,10,3),run(2026,10,6)];
  const stale=monthlyStats(runs,2026,10,new Date(2026,10,9));
  assert.equal(stale.activeDays,4); assert.equal(stale.longestStreak,3); assert.equal(stale.currentStreak,0);
  assert.equal(monthlyStats(runs,2026,10,new Date(2026,10,4)).currentStreak,3);
});
test('empty month has zero totals without copying another month',()=>{
  const empty=monthlyStats([run(2026,9,20,5)],2026,10,new Date(2026,10,2));
  for (const value of Object.values(empty)) assert.equal(value,0);
});
