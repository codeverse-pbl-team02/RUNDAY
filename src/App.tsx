import { useState } from 'react';
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

export type Screen =
  | 'running'
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
  return <div className="relative bg-white" style={{ width: 360, height: 800, overflow: 'hidden' }}>
    <RunProvider key={user?.uid}><AuthGate><ActivityProvider key={user?.uid}><MemberApp /></ActivityProvider></AuthGate></RunProvider>
  </div>;
}

function MemberApp() {
  const run = useRun();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [ploggingChallenge, setPloggingChallenge] = useState('광안리 해안 플로깅');
  const [ploggingSubmission, setPloggingSubmission] = useState<PloggingSubmission | null>(null);
  const [dogPhoto, setDogPhoto] = useState<File | null>(null);

  const openFreeRun = () => {
    if (run.mode === 'idle' || (run.mode === 'finished' && run.saved)) run.reset();
    setScreen('running');
  };

  return (
    <div className="relative bg-white" style={{ width: 360, height: 800, overflow: 'hidden' }}>
      {screen === 'home' && <HomeScreen onNavigate={(next) => { if (next === 'course-detail') setSelectedCourseId(1); setScreen(next); }} onStartFreeRun={openFreeRun} />}
      {screen === 'courses' && (
        <CourseListScreen
          onNavigate={setScreen}
          onSelectCourse={(id) => { setSelectedCourseId(id); setScreen('course-detail'); }}
        />
      )}
      {screen === 'course-detail' && <CourseDetailScreen onNavigate={setScreen} courseId={selectedCourseId} onStartCourse={(id) => { if (run.mode === 'idle' || (run.mode === 'finished' && run.saved)) run.start(id); setScreen('running'); }} />}
      {screen === 'records' && <RunHistory onStart={openFreeRun} onBack={() => setScreen('home')} />}
      {screen === 'running' && <RunningScreen onBack={() => setScreen('home')} onRecords={() => setScreen('records')} />}
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
    </div>
  );
}
