import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import AccountSettings, { ProfileEditor } from '../components/AccountSettings';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function ProfileScreen({ onNavigate }: Props) {
  const { user, profile } = useAuth();
  const [toggleReminder, setToggleReminder] = useState(true);
  const [toggleReport, setToggleReport] = useState(true);
  const [toggleRanking, setToggleRanking] = useState(false);

  const Row = ({ icon, label, value, chevron = true }: { icon: string; label: string; value?: string; chevron?: boolean }) => (
    <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[#d6e9f8] last:border-b-0">
      <span className="text-[18px] w-7 text-center shrink-0">{icon}</span>
      <p className="font-bold text-[14px] text-[#0d1b2e] flex-1">{label}</p>
      {value && <p className="text-[12px] text-[#94afc8] mr-1">{value}</p>}
      {chevron && <img src="/assets/da357.svg" alt="" className="w-[14px] h-[14px] shrink-0" />}
    </div>
  );

  const ToggleRow = ({ icon, label, sub, value, onChange }: { icon: string; label: string; sub: string; value: boolean; onChange: () => void }) => (
    <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[#d6e9f8] last:border-b-0">
      <span className="text-[18px] w-7 text-center shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="font-bold text-[14px] text-[#0d1b2e]">{label}</p>
        <p className="text-[11px] text-[#94afc8]">{sub}</p>
      </div>
      <button
        onClick={onChange}
        className="relative w-[44px] h-[24px] rounded-full shrink-0 transition-colors"
        style={{ backgroundColor: value ? '#0570db' : '#d1d5db' }}
      >
        <div
          className="absolute top-[2px] rounded-full size-[20px] bg-white transition-all"
          style={{ left: value ? 22 : 2 }}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#edf4fb]">
      {/* Dark header */}
      <div
        className="shrink-0 relative flex flex-col items-center px-5 pb-6 pt-5"
        style={{ background: 'linear-gradient(163deg, #17213d 8%, #1e3d6e 92%)' }}
      >
        {/* Back button */}
        <button
          onClick={() => onNavigate('home')}
          className="absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <img src="/assets/5d6ab.svg" alt="back" className="w-[18px] h-[18px]" />
        </button>

        {/* Title */}
        <p className="font-black text-[12px] text-white/50 tracking-[1.2px] mb-5">프로필 관리</p>

        {/* Avatar */}
        <div className="relative mb-3">
          <div
            className="w-[80px] h-[80px] rounded-full border-[2.4px] border-white"
            style={{ background: 'linear-gradient(135deg, #6acf98 0%, #60aedd 100%)' }}
          />
          <button
            className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full bg-[#0570db] border-[1.6px] border-white flex items-center justify-center"
          >
            <img src="/assets/2d61c.svg" alt="" className="w-3 h-3" />
          </button>
        </div>

        <p className="font-black text-[20px] text-white mb-0.5">{profile?.displayName || '러너'} 님</p>
        <p className="text-[12px] text-white/50 mb-2">{user?.email}</p>
        <div className="bg-white/10 rounded-full px-3 py-1 mb-4">
          <p className="text-[11px] text-white/70">{profile?.bio || '한 줄 소개를 추가해 주세요'}</p>
        </div>

        {/* Stats bar */}
        <div className="w-full bg-white/10 rounded-[16px] flex overflow-hidden">
          {[
            { val: '124.6', unit: 'km', label: '누적 거리' },
            { val: '38', unit: '회', label: '러닝 횟수' },
            { val: '10', unit: '개', label: '배지' },
            { val: '87', unit: '일', label: '활동 일수' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center py-3"
              style={{ borderRight: i < 3 ? '0.8px solid rgba(255,255,255,0.15)' : undefined }}
            >
              <p className="font-black text-white text-[16px] leading-none">
                {s.val}<span className="text-[10px]"> {s.unit}</span>
              </p>
              <p className="text-[9px] text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* 기본 정보 */}
        <div className="pt-5">
          <p className="text-[11px] font-black text-[#94afc8] tracking-[0.55px] px-5 mb-1.5">기본 정보</p>
          <div className="mx-4 bg-white border border-[#d6e9f8] rounded-[24px] overflow-hidden">
            <ProfileEditor />
            <Row icon="✏️" label="닉네임" value={profile?.displayName} chevron={false} />
            <Row icon="💬" label="한 줄 소개" value={profile?.bio || '소개 없음'} chevron={false} />
            <Row icon="📧" label="이메일" value={user?.email || ''} chevron={false} />
          </div>
        </div>

        {/* 러닝 설정 */}
        <div className="pt-5">
          <p className="text-[11px] font-black text-[#94afc8] tracking-[0.55px] px-5 mb-1.5">러닝 설정</p>
          <div className="mx-4 bg-white border border-[#d6e9f8] rounded-[24px] overflow-hidden">
            <Row icon="🎯" label="주간 목표 거리" value="30 km" />
            <Row icon="⚡" label="선호 페이스" value={`7'00" /km`} />
            <Row icon="🐕" label="반려견 프로필" value="해피 · 골든리트리버" />
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="pt-5">
          <p className="text-[11px] font-black text-[#94afc8] tracking-[0.55px] px-5 mb-1.5">알림 설정</p>
          <div className="mx-4 bg-white border border-[#d6e9f8] rounded-[24px] overflow-hidden">
            <ToggleRow icon="⏰" label="러닝 리마인더" sub="오전 7:00 알림" value={toggleReminder} onChange={() => setToggleReminder(!toggleReminder)} />
            <ToggleRow icon="📊" label="주간 리포트" sub="매주 월요일 발송" value={toggleReport} onChange={() => setToggleReport(!toggleReport)} />
            <ToggleRow icon="🏆" label="랭킹 업데이트" sub="순위 변동 시 알림" value={toggleRanking} onChange={() => setToggleRanking(!toggleRanking)} />
          </div>
        </div>

        {/* 연결된 서비스 */}
        <div className="pt-5">
          <p className="text-[11px] font-black text-[#94afc8] tracking-[0.55px] px-5 mb-1.5">연결된 서비스</p>
          <div className="mx-4 bg-white border border-[#d6e9f8] rounded-[24px] overflow-hidden">
            <Row icon="⌚" label="Apple Watch" value="연결됨" />
            <Row icon="📱" label="건강 앱" value="동기화 중" />
            <Row icon="🗺️" label="Strava" value="연결 안 됨" />
          </div>
        </div>

        {/* 계정 */}
        <div className="pt-5">
          <p className="text-[11px] font-black text-[#94afc8] tracking-[0.55px] px-5 mb-1.5">계정</p>
          <div className="mx-4 bg-white border border-[#d6e9f8] rounded-[24px] overflow-hidden">
            <AccountSettings />
          </div>
        </div>

        <p className="text-[10px] text-[#94afc8] text-center mt-5 mb-2">뛴DAY v1.0.0 · 이용약관 · 개인정보처리방침</p>
      </div>
    </div>
  );
}
