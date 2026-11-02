import AppPageHeader from '../components/AppPageHeader';
import BottomNav from '../components/BottomNav';
import MonthlyRunSummary from '../running/MonthlyRunSummary';
import { useAuth } from '../auth/AuthProvider';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const TOP3 = [
  { rank: 2, emoji: '🐰', name: '해운대페메', km: '128.5', streak: '연속 21일', badge: '👑 2위', isFirst: false },
  { rank: 1, emoji: '🐱', name: '러닝왕강지훈', km: '142.8', streak: '월간 MVP', badge: '👑 1위', isFirst: true },
  { rank: 3, emoji: '🐻', name: '매일뛰다보면', km: '115.2', streak: '연속 14일', badge: '👑 3위', isFirst: false },
];

const LIST = [
  { rank: 4, tier: '마라토너', emoji: '🐤', name: '페가수스', km: '98.4' },
  { rank: 5, tier: '스프린터', emoji: '⚡', name: '광안리 번개', km: '88.2' },
  { rank: 6, tier: '열정러너', emoji: '🐊', name: '다정한악어', km: '79.5' },
  { rank: 7, tier: '꾸준러너', emoji: '🐵', name: '기운찬초보', km: '72.1' },
  { rank: 8, tier: '산책마스터', emoji: '🐸', name: '폭풍질주', km: '65.4' },
  { rank: 9, tier: '새벽러너', emoji: '🐱', name: '깔끔한고양이', km: '58.0' },
];

export default function RankingScreen({ onNavigate }: Props) {
  const { profile, user } = useAuth();
  const nickname = profile?.displayName || user?.displayName || '러너';
  if (profile?.dataVersion === 2) return <div className="relative flex flex-col h-full bg-[#edf4fb]">
    <AppPageHeader onBack={() => onNavigate('home')} />
    <div className="flex-1 min-h-0 overflow-y-auto pb-[76px]">
    <h1 className="px-4 pt-2 font-bold text-[18px]">러닝 랭킹</h1>
    <div className="mt-3"><MonthlyRunSummary /></div>
    <div className="mx-4 mt-4 bg-white border border-[#dce3f1] rounded-3xl p-5">
      <p className="font-bold text-[#0d1b2e]">아직 참여한 랭킹이 없습니다.</p>
      <p className="mt-2 text-[12px] text-[#7b8796]">내 기록은 GPS 러닝 기록에서 확인할 수 있습니다.</p>
      <button onClick={() => onNavigate('records')} className="mt-4 rounded-full bg-[#bde3f6] text-[#285b78] text-[13px] font-bold px-4 py-2">내 기록 보기</button>
    </div>
    </div>
    <BottomNav active="records" onTabChange={tab => onNavigate(tab)} />
  </div>;
  return (
    <div className="relative flex flex-col h-full bg-[#edf4fb]">
      <AppPageHeader onBack={() => onNavigate('home')} />
      <div className="px-5 pb-4 shrink-0">
        <p className="flex min-w-0 whitespace-nowrap text-[14px] font-bold leading-6 text-black" title={`열심히 달려온 ${nickname}님의 기록을 분석해볼까요?`}>
          <span className="shrink-0">열심히 달려온&nbsp;</span><span className="min-w-0 truncate">{nickname}</span><span className="shrink-0">님의 기록을 분석해볼까요?</span>
        </p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[76px]">
        <MonthlyRunSummary />

        {/* Ranking header */}
        <div className="flex items-center justify-between px-4 pt-3 mb-1">
          <p className="font-bold text-[14px] text-[#7b8796]">월간 누적 거리 랭킹</p>
          <button>
            <p className="text-[12px] text-[#60aedd]">챌린지 규칙</p>
          </button>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-2 items-end px-4 mb-4" style={{ height: 208 }}>
          {TOP3.map((p) => (
            <div key={p.rank} className="min-w-0 flex flex-col items-center">
              {/* Badge label */}
              <div
                className="rounded-full px-2 py-0.5 mb-1"
                style={{ background: p.isFirst ? '#d4eee3' : '#e1f1fa' }}
              >
                <p className={`font-bold text-[10px] ${p.isFirst ? 'text-[#2f6853]' : 'text-[#285b78]'}`}>{p.badge}</p>
              </div>
              {/* Card */}
              <div
                className="w-full flex flex-col gap-1 items-center justify-center rounded-[24px]"
                style={{
                  height: p.isFirst ? 176 : 160,
                  background: '#fff',
                  border: p.isFirst ? '1px solid #c0e2d2' : '1px solid #dce3f1',
                  boxShadow: '0 2px 8px rgba(40,91,120,0.05)',
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: p.isFirst ? 64 : 56,
                    height: p.isFirst ? 64 : 56,
                    background: p.isFirst ? '#e1f1e7' : '#edf4fb',
                    border: '1px solid #dce3f1',
                  }}
                >
                  <span style={{ fontSize: p.isFirst ? 36 : 30 }}>{p.emoji}</span>
                </div>
                <p className="font-bold text-[12px] text-black text-center px-1">{p.name}</p>
                <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>
                  {p.km}<span className="font-normal text-[11px] text-[#7b8796] ml-0.5">km</span>
                </p>
                <div className="bg-[#edf4fb] rounded-full px-2 py-0.5">
                  <p className="font-medium text-[10px] text-[#61758c]">{p.streak}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rank list 4+ */}
        <div className="px-4 flex flex-col gap-2 mb-4">
          {LIST.map((item) => (
            <div
              key={item.rank}
              className="bg-white border border-[#dce3f1] rounded-[24px] flex gap-3 items-center px-4 py-3 shadow-sm"
            >
              <div className="flex flex-col items-center w-8 shrink-0">
                <p className="font-bold text-[14px] text-black" style={{ fontFamily: 'Consolas, monospace' }}>{item.rank}</p>
                <div className="bg-[#f8f9fa] rounded-full px-1.5 py-0.5">
                  <p className="text-[9px] text-[#7b8796] font-semibold">{item.tier}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#f9fafb] flex items-center justify-center shrink-0">
                <span className="text-[20px]">{item.emoji}</span>
              </div>
              <p className="font-bold text-[14px] text-black flex-1">{item.name}</p>
              <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>
                {item.km} km
              </p>
            </div>
          ))}
        </div>

        {/* My rank sticky card */}
        <div className="mx-4 bg-white border border-[#bde3f6] rounded-[24px] flex gap-3 items-center px-4 py-3 shadow-sm">
          <div className="flex flex-col items-center w-8 shrink-0">
            <p className="font-bold text-[14px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>24</p>
            <div className="bg-[#bde3f6] rounded-full px-1.5 py-0.5">
              <p className="font-bold text-[9px] text-[#285b78]">내 순위</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#edf4fb] border border-[#dce3f1] flex items-center justify-center shrink-0">
            <span className="text-[20px]">🐕</span>
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-[14px] text-[#60aedd]">야르렁</p>
            <p className="text-[10px] text-[#7b8796]">서면 생활권 · 연속 5일</p>
          </div>
          <p className="font-bold text-[16px] text-[#60aedd]" style={{ fontFamily: 'Consolas, monospace' }}>42.5 km</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-4 mt-4">
          <button className="flex-1 h-[48px] bg-white border border-[#dce3f1] rounded-[24px] flex items-center justify-center">
            <p className="font-bold text-[14px] text-[#285b78]">공유하기</p>
          </button>
          <button className="flex-1 h-[48px] bg-[#bde3f6] rounded-[24px] flex items-center justify-center">
            <p className="font-bold text-[14px] text-[#285b78]">1위 코스 따라뛰기</p>
          </button>
        </div>
      </div>
      <BottomNav active="records" onTabChange={tab => onNavigate(tab)} />
    </div>
  );
}
