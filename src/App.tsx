import { useState } from 'react';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthProvider';
import HomeScreen from './screens/HomeScreen';
import CourseListScreen from './screens/CourseListScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import { RunProvider } from './running/RunProvider';
import { RunBanner, RunningScreen, RunHistory } from './running/RunScreens';
import BenefitsScreen from './screens/BenefitsScreen';
import ESGScreen from './screens/ESGScreen';
import PloggingVerifyScreen from './screens/PloggingVerifyScreen';
import PloggingCompleteScreen from './screens/PloggingCompleteScreen';
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
    <RunProvider key={user?.uid}><AuthGate><MemberApp /></AuthGate></RunProvider>
  </div>;
}

function MemberApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);

  return (
    <div className="relative bg-white" style={{ width: 360, height: 800, overflow: 'hidden' }}>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'courses' && (
        <CourseListScreen
          onNavigate={setScreen}
          onSelectCourse={(id) => { setSelectedCourseId(id); setScreen('course-detail'); }}
        />
      )}
      {screen === 'course-detail' && <CourseDetailScreen onNavigate={setScreen} courseId={selectedCourseId} />}
      {screen === 'records' && <RunHistory onStart={() => setScreen('running')} onBack={() => setScreen('home')} />}
      {screen === 'running' && <RunningScreen onBack={() => setScreen('home')} onRecords={() => setScreen('records')} />}
      {screen !== 'running' && <RunBanner onOpen={() => setScreen('running')} />}
      {screen === 'benefits' && <BenefitsScreen onNavigate={setScreen} />}
      {screen === 'esg' && <ESGScreen onNavigate={setScreen} />}
      {screen === 'plogging-verify' && <PloggingVerifyScreen onNavigate={setScreen} />}
      {screen === 'plogging-complete' && <PloggingCompleteScreen onNavigate={setScreen} />}
      {screen === 'dog-verify' && <DogVerifyScreen onNavigate={setScreen} />}
      {screen === 'dog-complete' && <DogCompleteScreen onNavigate={setScreen} />}
      {screen === 'profile' && <ProfileScreen onNavigate={setScreen} />}
      {screen === 'my-badges' && <MyBadgesScreen onNavigate={setScreen} />}
      {screen === 'ranking-full' && <RankingScreen onNavigate={setScreen} />}
    </div>
  );
}
