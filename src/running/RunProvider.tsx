import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getFirebase } from '../lib/firebase';
import { useAuth } from '../auth/AuthProvider';
import { authError } from '../auth/errors';

export interface Point { latitude: number; longitude: number; timestamp: number; segment: number }
type Mode = 'idle' | 'locating' | 'running' | 'paused' | 'finished';
interface Session { id: string; startedAt: number; distance: number; elapsed: number; points: Point[]; segment: number }
export function distanceMeters(a: Point, b: Point) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)));
}
export function clockText(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor(s / 60 % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
export function paceText(meters: number, seconds: number) {
  if (meters < 50 || seconds <= 0) return '—';
  const pace = Math.round(seconds / (meters / 1000));
  return `${Math.floor(pace / 60)}′${(pace % 60).toString().padStart(2, '0')}″`;
}
function geoError(error: GeolocationPositionError) {
  if (error.code === 1) return '위치 권한이 차단되었습니다. 브라우저의 사이트 설정에서 위치를 허용해 주세요.';
  if (error.code === 3) return '위치를 찾는 데 시간이 걸립니다. 실외에서 다시 시도해 주세요.';
  return '위치를 확인할 수 없습니다. 기기의 위치 서비스를 켜고 다시 시도해 주세요.';
}
const emptySession = (): Session => ({ id: '', startedAt: 0, distance: 0, elapsed: 0, points: [], segment: 0 });
interface RunContextValue {
  mode: Mode; session: Session; elapsed: number; message: string; accuracy: number | null;
  current: Point | null; locating: boolean; saving: boolean; saved: boolean;
  locate: () => void; start: () => void; pause: () => void; resume: () => void;
  finish: () => void; save: () => Promise<void>; reset: () => void;
}
const RunContext = createContext<RunContextValue | null>(null);
export function RunProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('idle');
  const modeRef = useRef<Mode>('idle');
  const sessionRef = useRef<Session>(emptySession());
  const [session, setSession] = useState(sessionRef.current);
  const [current, setCurrent] = useState<Point | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, tick] = useState(0);
  const watch = useRef<number | null>(null);
  const generation = useRef(0);
  const locationGeneration = useRef(0);
  const saveLock = useRef(false);
  const activeSince = useRef<number | null>(null);
  function setStatus(next: Mode) { modeRef.current = next; setMode(next); }
  function publish() { setSession({ ...sessionRef.current, points: [...sessionRef.current.points] }); }
  function stopWatch() {
    generation.current++;
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
  }
  function elapsedNow() {
    return sessionRef.current.elapsed + (activeSince.current === null ? 0 : (performance.now() - activeSince.current) / 1000);
  }
  function pause() {
    if (!['locating', 'running'].includes(modeRef.current)) return;
    sessionRef.current.elapsed = elapsedNow();
    activeSince.current = null;
    stopWatch();
    setStatus(sessionRef.current.startedAt ? 'paused' : 'idle');
    publish();
  }
  useEffect(() => {
    const timer = setInterval(() => {
      if (modeRef.current === 'running') {
        if (elapsedNow() >= 86400) { pause(); setMessage('24시간 기록 한도에 도달했습니다. 종료 후 저장해 주세요.'); }
        tick(v => v + 1);
      }
    }, 1000);
    const hidden = () => {
      if (document.hidden && ['running', 'locating'].includes(modeRef.current)) {
        pause(); setMessage('화면이 백그라운드로 이동해 일시정지했습니다. 화면을 켜고 이어 달리기를 눌러 주세요.');
      }
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (sessionRef.current.startedAt) { event.preventDefault(); event.returnValue = ''; }
    };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      clearInterval(timer); stopWatch(); locationGeneration.current++;
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);
  function available() {
    if (!window.isSecureContext) { setMessage('위치 기능은 HTTPS 주소에서 사용할 수 있습니다.'); return false; }
    if (!navigator.geolocation) { setMessage('이 브라우저는 위치 기능을 지원하지 않습니다.'); return false; }
    return true;
  }
  function locate() {
    if (locating || !available()) return;
    setLocating(true); setMessage('');
    const version = ++locationGeneration.current;
    navigator.geolocation.getCurrentPosition(position => {
      if (version !== locationGeneration.current) return;
      setCurrent({ latitude: position.coords.latitude, longitude: position.coords.longitude, timestamp: position.timestamp, segment: 0 });
      setAccuracy(position.coords.accuracy); setLocating(false);
    }, error => {
      if (version !== locationGeneration.current) return;
      setMessage(geoError(error)); setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  function watchPosition() {
    if (!available()) return;
    stopWatch(); setStatus('locating'); setMessage('GPS 신호를 찾고 있습니다.');
    const version = generation.current;
    let previous: Point | null = null;
    watch.current = navigator.geolocation.watchPosition(position => {
      if (version !== generation.current) return;
      const { latitude, longitude, accuracy: acc } = position.coords;
      if (![latitude, longitude, acc, position.timestamp].every(Number.isFinite)
        || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || acc < 0
        || Date.now() - position.timestamp > 30000 || position.timestamp > Date.now() + 5000) return;
      setAccuracy(acc);
      if (acc > 50) { setMessage('GPS 정확도가 낮습니다. 탁 트인 실외에서 기다려 주세요.'); return; }
      const point: Point = { latitude, longitude, timestamp: position.timestamp, segment: sessionRef.current.segment };
      setCurrent(point);
      if (modeRef.current === 'locating') {
        if (!sessionRef.current.startedAt) sessionRef.current.startedAt = Date.now();
        activeSince.current = performance.now(); setStatus('running');
      }
      setMessage('');
      if (previous) {
        const seconds = (point.timestamp - previous.timestamp) / 1000;
        if (seconds < 2) return;
        if (seconds > 30) {
          sessionRef.current.segment++; point.segment = sessionRef.current.segment;
        } else {
          const distance = distanceMeters(previous, point);
          if (distance / seconds > 12 || distance < Math.max(5, Math.min(acc / 2, 15))) return;
          sessionRef.current.distance += distance;
        }
      }
      previous = point;
      sessionRef.current.points.push(point);
      publish();
      if (sessionRef.current.points.length >= 3000) {
        pause(); setMessage('이번 러닝의 경로 기록 한도에 도달했습니다. 종료 후 저장해 주세요.');
      }
    }, error => {
      if (version !== generation.current) return;
      pause(); setMessage(geoError(error));
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  }
  function start() {
    if (modeRef.current !== 'idle') return;
    sessionRef.current = { ...emptySession(), id: crypto.randomUUID() };
    setSaved(false); publish(); watchPosition();
  }
  function resume() {
    if (modeRef.current !== 'paused' || sessionRef.current.points.length >= 3000 || elapsedNow() >= 86400) return;
    sessionRef.current.segment++; watchPosition();
  }
  function finish() {
    if (!['running', 'paused', 'locating'].includes(modeRef.current)) return;
    pause();
    if (!sessionRef.current.startedAt) return;
    setStatus('finished'); setMessage('종료했습니다. 저장 버튼을 눌러 기록을 보관하세요.');
  }
  async function save() {
    if (saveLock.current || saved || modeRef.current !== 'finished' || !user) return;
    saveLock.current = true; setSaving(true); setMessage('');
    try {
      const data = sessionRef.current;
      const ref = doc(getFirebase().db, 'rundayUsers', user.uid, 'runs', data.id);
      await runTransaction(getFirebase().db, async transaction => {
        if (!(await transaction.get(ref)).exists()) transaction.set(ref, {
          startedAt: data.startedAt, durationSeconds: Math.max(1, Math.floor(data.elapsed)),
          distanceMeters: Math.round(data.distance), points: data.points, createdAt: serverTimestamp(),
        });
      });
      setSaved(true); setMessage('러닝 기록을 저장했습니다.');
      // The session stays visible, but no longer needs a page-leave warning.
      sessionRef.current = { ...data, startedAt: 0 };
    } catch (error) { setMessage(authError(error)); }
    finally { saveLock.current = false; setSaving(false); }
  }
  function reset() {
    if (saving) return;
    stopWatch(); activeSince.current = null; sessionRef.current = emptySession();
    publish(); setStatus('idle'); setSaved(false); setMessage('');
  }
  return <RunContext.Provider value={{ mode, session, elapsed: elapsedNow(), message, accuracy, current, locating, saving, saved, locate, start, pause, resume, finish, save, reset }}>{children}</RunContext.Provider>;
}
export function useRun() {
  const context = useContext(RunContext);
  if (!context) throw new Error('RunProvider required');
  return context;
}
