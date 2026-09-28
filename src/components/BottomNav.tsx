const homeActiveIcon = '/assets/f1d62.svg';
const mapIcon = '/assets/aee38.svg';
const trelloIcon = '/assets/846a2.svg';
const starIcon = '/assets/d0a40.svg';

export type TabId = 'home' | 'courses' | 'records' | 'benefits' | 'esg';

interface BottomNavProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon?: string; emoji?: string }[] = [
  { id: 'home', label: '홈', icon: homeActiveIcon },
  { id: 'courses', label: '코스', icon: mapIcon },
  { id: 'records', label: '기록', icon: trelloIcon },
  { id: 'benefits', label: '혜택', icon: starIcon },
  { id: 'esg', label: 'ESG', emoji: '♻️' },
];

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0570db] flex items-center h-[60px] px-2 z-50">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
          >
            <div className="flex items-center justify-center w-5 h-5">
              {tab.emoji ? (
                <span
                  className="text-[16px] leading-none"
                  style={{ filter: 'grayscale(1) brightness(0) invert(1)', opacity: isActive ? 1 : 0.7 }}
                >
                  {tab.emoji}
                </span>
              ) : tab.icon ? (
                <img src={tab.icon} alt="" className="w-[18px] h-[18px] object-contain" style={{ opacity: isActive ? 1 : 0.7 }} />
              ) : null}
            </div>
            <span
              className="text-[10px] font-black leading-none"
              style={{
                fontFamily: 'Noto Sans KR',
                fontWeight: 900,
                color: isActive ? '#fff' : '#9fc7f9',
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
