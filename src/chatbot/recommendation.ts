export const recommendationQuestions = [
  { key: 'condition', question: '오늘 컨디션은 어떤가요?', options: [
    { value: 'good', label: '좋아요' }, { value: 'normal', label: '보통이에요' },
    { value: 'tired', label: '조금 피곤해요' }, { value: 'rest', label: '오늘은 쉬고 싶어요' },
  ] },
  { key: 'pace', question: '평소 1km를 몇 분 정도에 달리나요?', options: [
    { value: '5', label: '5분대' }, { value: '6', label: '6분대' }, { value: '7', label: '7분대' },
    { value: '8', label: '8분대' }, { value: '9', label: '9분 이상' }, { value: 'unknown', label: '잘 모르겠어요' },
  ] },
  { key: 'activity', question: '오늘은 어떤 활동을 하고 싶나요?', options: [
    { value: 'jog', label: '조깅' }, { value: 'walk', label: '걷기·산책' }, { value: 'light', label: '가볍게 뛰기' },
  ] },
] as const;
export interface RecommendationAnswers { condition: string; pace: string; activity: string }
export interface RecommendationPlan {
  distanceKm: number; paceMinSeconds: number; paceMaxSeconds: number;
  durationMin: number; durationMax: number; activity: string; summary: string;
}
export function isRecommendationTrigger(value: string) {
  return /^(러닝추천받기|러닝추천(해줘|해주세요)?)$/.test(value.replace(/\s+/g, '').replace(/[.!?]+$/, ''));
}
export function formatRecommendationPace(seconds: number) {
  return `${Math.floor(seconds / 60)}분 ${String(seconds % 60).padStart(2, '0')}초`;
}
// Product presets for a gentle session, not a fitness assessment or training prescription.
export function makeRecommendation(answers: RecommendationAnswers): RecommendationPlan | null {
  if (answers.condition === 'rest') return null;
  if (!recommendationQuestions.every(q => q.options.some(o => o.value === answers[q.key]))) throw new Error('Invalid recommendation choice');
  const walk = answers.activity === 'walk';
  const tired = answers.condition === 'tired';
  const baseline = answers.pace === 'unknown' ? 510 : Number(answers.pace) * 60 + 30;
  const paceMinSeconds = walk ? 660 : baseline + (answers.activity === 'light' ? 90 : 45) + (tired ? 30 : 0);
  const paceMaxSeconds = paceMinSeconds + (walk ? 180 : 60);
  const minutes = tired ? 15 : answers.activity === 'jog' ? (answers.condition === 'good' ? 30 : 25) : 20;
  const averagePace = (paceMinSeconds + paceMaxSeconds) / 2 / 60;
  const distanceKm = Math.max(0.5, Math.min(5, Math.round(minutes / averagePace * 2) / 2));
  return { distanceKm, paceMinSeconds, paceMaxSeconds,
    durationMin: Math.round(distanceKm * paceMinSeconds / 60), durationMax: Math.round(distanceKm * paceMaxSeconds / 60),
    activity: walk ? '걷기·산책' : answers.activity === 'jog' ? '조깅' : '가볍게 뛰기',
    summary: tired ? '피곤한 날이라 활동 시간을 짧게 잡았어요.' : answers.pace === 'unknown' && !walk
      ? '평소 페이스를 몰라 느린 시작값을 사용했어요. 편한 속도에 맞춰 조절해 주세요.'
      : walk ? '걷기 페이스는 평소 러닝 페이스와 별도로 잡았어요.' : '평소 페이스보다 여유 있는 속도로 잡았어요.',
  };
}
