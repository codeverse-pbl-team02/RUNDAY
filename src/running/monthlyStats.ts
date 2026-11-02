import type { SavedRun } from './ActivityProvider';

export function monthlyStats(runs: SavedRun[], year: number, month: number, now = new Date()) {
  const selected = runs.filter(run => {
    const date = new Date(run.startedAt);
    return date.getFullYear() === year && date.getMonth() === month && run.startedAt <= now.getTime();
  });
  const distanceKm = selected.reduce((sum, run) => sum + Math.max(0, run.distanceMeters || 0), 0) / 1000;
  const minutes = Math.round(selected.reduce((sum, run) => sum + Math.max(0, run.durationSeconds || 0), 0) / 60);
  const days = [...new Set(selected.map(run => {
    const date = new Date(run.startedAt);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }))].sort((a,b) => a-b);
  let streak = 0, longestStreak = 0;
  for (let i=0; i<days.length; i++) {
    streak = i > 0 && days[i] - days[i-1] === 86_400_000 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
  }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const currentStreak = days.length && today - days[days.length-1] <= 86_400_000 ? streak : 0;
  return { distanceKm, count: selected.length, minutes, longestStreak, currentStreak, activeDays: days.length };
}
