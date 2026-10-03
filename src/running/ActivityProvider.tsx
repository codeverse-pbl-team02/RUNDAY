import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import { authError } from '../auth/errors';
import { getFirebase } from '../lib/firebase';
import type { Point } from './RunProvider';

export interface SavedRun {
  id: string;
  startedAt: number;
  distanceMeters: number;
  durationSeconds: number;
  points: Point[];
}

interface ActivityState {
  runs: SavedRun[];
  loading: boolean;
  error: string;
  totalDistanceMeters: number;
  activeDays: number;
  longestStreak: number;
  badgeCount: number;
}

const ActivityContext = createContext<ActivityState | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(getFirebase().db, 'rundayUsers', user.uid, 'runs'), orderBy('startedAt', 'desc')),
      snapshot => {
        setRuns(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as SavedRun));
        setError('');
        setLoading(false);
      },
      cause => { setError(authError(cause)); setLoading(false); },
    );
  }, [user]);

  const totals = useMemo(() => {
    const totalDistanceMeters = runs.reduce((sum, run) => sum + run.distanceMeters, 0);
    const days = [...new Set(runs.map(run => {
      const date = new Date(run.startedAt);
      return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    }))].sort((a, b) => a - b);
    let streak = 0;
    let longestStreak = 0;
    days.forEach((day, index) => {
      streak = index > 0 && day - days[index - 1] === 86_400_000 ? streak + 1 : 1;
      longestStreak = Math.max(longestStreak, streak);
    });
    const km = totalDistanceMeters / 1000;
    const badgeCount = [1, 10, 50, 100, 200, 500].filter(goal => km >= goal).length
      + [7, 14, 21, 30, 100].filter(goal => longestStreak >= goal).length;
    return { totalDistanceMeters, activeDays: days.length, longestStreak, badgeCount };
  }, [runs]);

  return <ActivityContext.Provider value={{ runs, loading, error, ...totals }}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('ActivityProvider is required');
  return context;
}
