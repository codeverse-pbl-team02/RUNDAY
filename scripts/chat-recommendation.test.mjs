import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/chatbot/recommendation.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { makeRecommendation, recommendationQuestions, isRecommendationTrigger } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

test('every selectable combination produces consistent distance, pace and estimated time', () => {
  for (const condition of recommendationQuestions[0].options) {
    for (const pace of recommendationQuestions[1].options) {
      for (const activity of recommendationQuestions[2].options) {
        const p = makeRecommendation({ condition: condition.value, pace: pace.value, activity: activity.value });
        if (condition.value === 'rest') { assert.equal(p, null); continue; }
        assert.ok(p.distanceKm >= 0.5 && p.distanceKm <= 5);
        assert.ok(p.paceMinSeconds < p.paceMaxSeconds);
        assert.equal(p.durationMin, Math.round(p.distanceKm * p.paceMinSeconds / 60));
        assert.equal(p.durationMax, Math.round(p.distanceKm * p.paceMaxSeconds / 60));
      }
    }
  }
});
test('tired sessions are shorter and slower, while walking ignores running pace', () => {
  const normal = makeRecommendation({ condition:'normal', pace:'6', activity:'jog' });
  const tired = makeRecommendation({ condition:'tired', pace:'6', activity:'jog' });
  assert.ok(tired.distanceKm < normal.distanceKm);
  assert.ok(tired.paceMinSeconds > normal.paceMinSeconds);
  const a = makeRecommendation({ condition:'good', pace:'5', activity:'walk' });
  const b = makeRecommendation({ condition:'good', pace:'9', activity:'walk' });
  assert.deepEqual(a,b);
  assert.match(makeRecommendation({condition:'normal',pace:'unknown',activity:'light'}).summary,/느린 시작값/);
});
test('explicit recommendation phrases activate the flow without swallowing unrelated questions', () => {
  for (const text of ['러닝 추천받기', '러닝 추천해줘', '러닝 추천 해 주세요!']) assert.equal(isRecommendationTrigger(text),true);
  assert.equal(isRecommendationTrigger('러닝 기록은 어떻게 저장해?'),false);
  assert.throws(() => makeRecommendation({condition:'normal',pace:'bad',activity:'jog'}));
});
