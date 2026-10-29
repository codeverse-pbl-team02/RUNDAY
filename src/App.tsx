import { useEffect, useRef, useState } from 'react';
import { App as NativeApp } from '@capacitor/app';
import { isNative } from './platform/native';
import { consumeBackAction } from './navigation/backActions';
import { useBackAction } from './navigation/useBackAction';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthProvider';
import HomeScreen from './screens/HomeScreen';
import CourseListScreen from './screens/CourseListScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import { RunProvider, useRun } from './running/RunProvider';
import { ActivityProvider } from './running/ActivityProvider';
import { RunBanner, RunningScreen, RunHistory } from './running/RunScreens';
import BenefitsScreen from './screens/BenefitsScreen';
import ESGScreen from './screens/ESGScreen';
import PloggingVerifyScreen from './screens/PloggingVerifyScreen';
import PloggingCompleteScreen from './screens/PloggingCompleteScreen';
import type { PloggingSubmission } from './screens/ploggingTypes';
import DogVerifyScreen from './screens/DogVerifyScreen';
import DogCompleteScreen from './screens/DogCompleteScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyBadgesScreen from './screens/MyBadgesScreen';
import RankingScreen from './screens/RankingScreen';
import { ServiceAreaProvider } from './location/ServiceAreaProvider';
import RoutePlannerScreen from './screens/RoutePlannerScreen';
import { RunningServiceGate } from './location/RunningServiceGate';

export type Screen =
  | 'running'
  | 'route-planner'
  | 'login'
  | 'home'
  | 'courses'
  | 'course-detail'
  | 'records'
  | 'benefits'
  | 'esg'
  | 'plogging-verify'
  | 'plogging-complete'
  | 'dog-verify'
  | 'dog-complete'
  | 'profile'
  | 'my-badges'
  | 'ranking-full';

export default function App() {
  const { user } = useAuth();
  return <div className="relative bg-white" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
    <RunProvider key={user?.uid}><AuthGate><ActivityProvider key={user?.uid}><MemberApp /></ActivityProvider></AuthGate></RunProvider>
  </div>;
}

function MemberApp() {
  const run = useRun();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [ploggingChallenge, setPloggingChallenge] = useState('광안리 해안 플로깅');
  const [ploggingSubmission, setPloggingSubmission] = useState<PloggingSubmission | null>(null);
  const [dogPhoto, setDogPhoto] = useState<File | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitError, setExitError] = useState('');
  const [exiting, setExiting] = useState(false);
  const exitLock = useRef(false);
  useBackAction(exitOpen, () => { if (!exitLock.current) setExitOpen(false); });

  async function exitApp() {
    try { await NativeApp.exitApp(); }
    catch { setExitError('앱을 종료하지 못했습니다. 다시 시도해 주세요.'); setExitOpen(true); }
  }

  const backAction = useRef(() => {});
  backAction.current = () => {
    if (consumeBackAction()) return;
    if (screen === 'home') {
      if (run.mode !== 'idle' && !run.saved) {
        run.pause();
        setExitError('');
        setExitOpen(true);
      } else void exitApp();
    } else if (screen === 'course-detail') setScreen('courses');
    else if (['plogging-verify', 'plogging-complete', 'dog-verify', 'dog-complete'].includes(screen)) setScreen('esg');
    else setScreen('home');
  };

  useEffect(() => {
    if (!isNative) return;
    let disposed = false;
    let remove: (() => void) | undefined;
    void NativeApp.addListener('backButton', () => backAction.current())
      .then(listener => { if (disposed) void listener.remove(); else remove = () => { void listener.remove(); }; });
    return () => { disposed = true; remove?.(); };
  }, []);

  const openFreeRun = () => {
    if (run.mode === 'idle' || (run.mode === 'finished' && run.saved)) run.reset();
    setScreen('running');
  };

  const openCourse = (id: number) => {
    setSelectedCourseId(id);
    setScreen('course-detail');
  };

  return (
    <ServiceAreaProvider enabled={run.mode === 'running' || run.mode === 'locating' || ['home', 'courses', 'course-detail', 'route-planner', 'running'].includes(screen)}>
    <div className="relative bg-white" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} onStartFreeRun={openFreeRun} onSelectCourse={openCourse} />}
      {screen === 'route-planner' && <RunningServiceGate onBack={() => setScreen('home')}><RoutePlannerScreen onBack={() => setScreen('home')}
        onOpenRunning={() => setScreen('running')} onStart={route => { const started = run.startRoute(route); if (started) setScreen('running'); return started; }} /></RunningServiceGate>}
      {screen === 'courses' && (
        <CourseListScreen
          onNavigate={setScreen}
          onSelectCourse={openCourse}
        />
      )}
      {screen === 'course-detail' && <RunningServiceGate onBack={() => setScreen('home')}><CourseDetailScreen onNavigate={setScreen} courseId={selectedCourseId} onStartCourse={(id) => { if (run.mode === 'idle' || (run.mode === 'finished' && run.saved)) { if (!run.start(id)) return; } setScreen('running'); }} /></RunningServiceGate>}
      {screen === 'records' && <RunHistory onStart={openFreeRun} onBack={() => setScreen('home')} />}
      {screen === 'running' && <RunningServiceGate onBack={() => setScreen('home')}><RunningScreen onBack={() => setScreen('home')} onRecords={() => setScreen('records')} /></RunningServiceGate>}
      {screen !== 'running' && <RunBanner onOpen={() => setScreen('running')} />}
      {screen === 'benefits' && <BenefitsScreen onNavigate={setScreen} />}
      {screen === 'esg' && <ESGScreen onNavigate={setScreen} onPloggingVerify={(title) => { setPloggingChallenge(title); setScreen('plogging-verify'); }} />}
      {screen === 'plogging-verify' && <PloggingVerifyScreen onNavigate={setScreen} challengeTitle={ploggingChallenge} onComplete={(submission) => { setPloggingSubmission(submission); setScreen('plogging-complete'); }} />}
      {screen === 'plogging-complete' && ploggingSubmission && <PloggingCompleteScreen onNavigate={setScreen} submission={ploggingSubmission} />}
      {screen === 'dog-verify' && <DogVerifyScreen onNavigate={setScreen} onComplete={(photo) => { setDogPhoto(photo); setScreen('dog-complete'); }} />}
      {screen === 'dog-complete' && dogPhoto && <DogCompleteScreen onNavigate={setScreen} photo={dogPhoto} />}
      {screen === 'profile' && <ProfileScreen onNavigate={setScreen} />}
      {screen === 'my-badges' && <MyBadgesScreen onNavigate={setScreen} />}
      {screen === 'ranking-full' && <RankingScreen onNavigate={setScreen} />}
      {exitOpen && <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-5">
        <div role="dialog" aria-modal="true" aria-labelledby="exit-title" className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
          <h2 id="exit-title" className="text-[18px] font-bold">앱을 종료할까요?</h2>
          <p className="mt-2 text-[13px] text-[#4a6080]">{run.saved || run.mode === 'idle' ? '아래 버튼을 눌러 앱을 종료해 주세요.' : '저장하지 않은 러닝이 있습니다. 기록을 저장하거나 버린 뒤 종료할 수 있습니다.'}</p>
          {(exitError || run.message) && <p role="status" className="mt-2 text-[12px] text-[#4a6080]">{exitError || run.message}</p>}
          <div className="mt-4 flex flex-col gap-2">
            {!run.saved && run.session.points.length > 0 && <button type="button" disabled={exiting || run.saving} className="rounded-2xl bg-[#0570db] px-4 py-3 text-[14px] font-bold text-white disabled:opacity-50" onClick={async () => {
              if (exitLock.current || run.saving) return;
              exitLock.current = true; setExiting(true); setExitError('');
              try { run.finish(); if (await run.save()) await exitApp(); }
              finally { exitLock.current = false; setExiting(false); }
            }}>{exiting || run.saving ? '저장 중…' : '기록 저장 후 종료'}</button>}
            <button type="button" disabled={exiting || run.saving} className="rounded-2xl border border-[#dce3f1] px-4 py-3 text-[14px] text-red-600 disabled:opacity-50" onClick={async () => {
              if (exitLock.current || run.saving) return;
              exitLock.current = true; setExiting(true);
              try { run.reset(); await exitApp(); }
              finally { exitLock.current = false; setExiting(false); }
            }}>{run.saved || run.mode === 'idle' ? '앱 종료' : '기록 버리고 종료'}</button>
            <button type="button" disabled={exiting || run.saving} className="px-4 py-3 text-[14px] text-[#0570db] disabled:opacity-50" onClick={() => { setExitOpen(false); setScreen('running'); }}>{run.saved || run.mode === 'idle' ? '러닝 화면으로' : '종료 취소 · 러닝으로'}</button>
          </div>
        </div>
      </div>}
    </div>
    </ServiceAreaProvider>
  );
}
