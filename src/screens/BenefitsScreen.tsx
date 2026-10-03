import { brandLogo } from '../lib/assets';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../auth/AuthProvider';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function BenefitsScreen({ onNavigate }: Props) {
  const { profile } = useAuth();
  const freshAccount = profile?.dataVersion === 2;
  return (
    <div className="flex flex-col h-full relative bg-[#edf4fb]">
      {/* Header */}
      <div className="bg-[#edf4fb] flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
        <button onClick={() => onNavigate('home')} className="size-6 flex items-center justify-center shrink-0">
          <img src="/assets/c4f3a.svg" alt="back" className="size-full" />
        </button>
        <div className="flex-1 flex justify-center">
          <img alt="" className="h-9 object-contain" src={brandLogo} />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[60px]">
        {/* Title */}
        <div className="px-5 pb-4">
          <div className="font-bold text-black text-[18px] leading-[0]">
            <p className="leading-[28px] mb-0">달리는 만큼</p>
            <p className="leading-[28px]">쌓이는 혜택!</p>
          </div>
        </div>

        {/* Points card */}
        <div className="px-4 mb-4">
          <div className="bg-[#0570db] flex flex-col items-start p-5 rounded-[24px] w-full">
            <div className="flex items-center justify-between w-full">
              <p className="font-normal text-[#9fc7f9] text-[13px] leading-[19.5px]">보유 포인트</p>
              <p className="font-normal text-[rgba(255,255,255,0.6)] text-[12px]">내역 보기 →</p>
            </div>
            <div className="flex gap-1 items-end mt-1">
              <p className="font-black text-[32px] text-white leading-9">{freshAccount ? (profile?.pointsBalance ?? 0).toLocaleString() : '4,820'}</p>
              <p className="font-normal text-[#9fc7f9] text-[14px] pb-1">P</p>
            </div>
            <div className="w-full mt-4">
              <div className="flex items-center justify-between">
                <p className="font-normal text-[#9fc7f9] text-[11px]">{freshAccount ? '첫 포인트를 모아보세요' : '다음 등급까지 1,180P'}</p>
                <p className="font-normal text-[rgba(255,255,255,0.5)] text-[11px]">{freshAccount ? '시작' : '골드'}</p>
              </div>
              <div className="bg-[rgba(255,255,255,0.2)] rounded-full h-[6px] mt-1 w-full overflow-hidden">
                <div className="bg-white h-[6px] rounded-full" style={{ width: freshAccount ? '0%' : '80%' }} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 w-full">
              {['포인트 적립', '포인트 사용'].map((label) => (
                <button key={label} className="flex-1 bg-[rgba(255,255,255,0.15)] rounded-[12px] py-2">
                  <p className="font-bold text-[13px] text-white text-center">{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 적립 내역 */}
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-[14px] text-[#1d1b20]">적립 내역</p>
            <p className="font-normal text-[12px] text-[#0570db]">전체보기</p>
          </div>
          <p className="font-normal text-[12px] text-[#7b8796] mb-2">최근 나의 적립 내역을 살펴보세요!</p>
          <div className="bg-white rounded-[24px] px-5 pt-1 drop-shadow-[0px_2px_6px_rgba(5,112,219,0.06)]">
            {freshAccount ? <p className="py-5 text-[12px] text-[#7b8796]">아직 포인트 적립·사용 내역이 없습니다.</p> : [
              { icon: '/assets/88fd6.svg', iconBg: '#e8f4ff', title: '광안리 5km 완주', time: '오늘 07:38', point: '+200P', pointColor: '#0570db' },
              { icon: '/assets/88fd6.svg', iconBg: '#e8f4ff', title: 'SNS 인증샷 공유', time: '오늘 08:12', point: '+50P', pointColor: '#0570db' },
              { icon: '/assets/88fd6.svg', iconBg: '#e8f4ff', title: '카페 파도 방문 인증', time: '어제 09:22', point: '+100P', pointColor: '#0570db' },
              { icon: '/assets/764de.svg', iconBg: '#fff0f0', title: '스포츠 365 쿠폰 사용', time: '3일 전', point: '-500P', pointColor: '#ff6b6b' },
              { icon: '/assets/88fd6.svg', iconBg: '#e8f4ff', title: '플로깅 인증', time: '4일 전', point: '+300P', pointColor: '#0570db' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#f0f4f8] last:border-0">
                <div className="flex gap-3 items-center">
                  <div className="rounded-full size-[28px] flex items-center justify-center shrink-0" style={{ backgroundColor: item.iconBg }}>
                    <img src={item.icon} alt="" className="size-[12px]" />
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-[#1d1b20] leading-[19.5px]">{item.title}</p>
                    <p className="font-normal text-[11px] text-[#aaa] leading-[16.5px]">{item.time}</p>
                  </div>
                </div>
                <p className="font-black text-[14px] leading-[21px]" style={{ color: item.pointColor }}>{item.point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 내 주변 혜택 */}
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-[14px] text-[#1d1b20]">내 주변 혜택</p>
            <div className="flex gap-3 items-center">
              <p className="font-normal text-[12px] text-[#aaa]">오늘 11:16 기준</p>
              <p className="font-normal text-[12px] text-[#0570db]">목록</p>
            </div>
          </div>
          <div className="rounded-[24px] overflow-hidden">
            <div className="bg-[#f5efe0] h-[240px] relative w-full overflow-hidden">
              {/* Concentric rings */}
              <div className="absolute inset-[8%_14%_5%_14%]">
                <img alt="" className="block size-full" src="/assets/1566d.svg" />
              </div>
              <div className="absolute inset-[20%_24%_17%_24%]">
                <img alt="" className="block size-full" src="/assets/5fa3e.svg" />
              </div>
              <div className="absolute inset-[28%_30%_24%_30%]">
                <img alt="" className="block size-full" src="/assets/173e8.svg" />
              </div>
              <div className="absolute inset-[38%_38%_34%_38%]">
                <img alt="" className="block size-full" src="/assets/6c948.svg" />
              </div>
              {/* Map pins */}
              <div className="absolute" style={{ top: '40%', left: '36%' }}>
                <div className="bg-white rounded-full size-[28px] flex items-center justify-center drop-shadow border border-[#d6e9f8]">
                  <span className="text-[14px]">☕</span>
                </div>
                <div className="bg-[#0570db] rounded-full px-1 text-center mt-0.5">
                  <p className="text-white text-[8px] font-bold">120m</p>
                </div>
              </div>
              <div className="absolute" style={{ top: '62%', left: '18%' }}>
                <div className="bg-white rounded-full size-[28px] flex items-center justify-center drop-shadow border border-[#d6e9f8]">
                  <span className="text-[14px]">🍜</span>
                </div>
                <div className="bg-[#0570db] rounded-full px-1 text-center mt-0.5">
                  <p className="text-white text-[8px] font-bold">210m</p>
                </div>
              </div>
              <div className="absolute" style={{ top: '60%', left: '62%' }}>
                <div className="bg-white rounded-full size-[28px] flex items-center justify-center drop-shadow border border-[#d6e9f8]">
                  <span className="text-[14px]">👟</span>
                </div>
                <div className="bg-[#0570db] rounded-full px-1 text-center mt-0.5">
                  <p className="text-white text-[8px] font-bold">340m</p>
                </div>
              </div>
              <div className="absolute" style={{ top: '38%', left: '50%' }}>
                <div className="bg-white rounded-full size-[28px] flex items-center justify-center drop-shadow border border-[#d6e9f8]">
                  <span className="text-[14px]">🏪</span>
                </div>
                <div className="bg-[#0570db] rounded-full px-1 text-center mt-0.5">
                  <p className="text-white text-[8px] font-bold">80m</p>
                </div>
              </div>
              {/* Info tooltips */}
              <div className="absolute bg-[rgba(255,255,255,0.92)] rounded-[8px] shadow px-2 py-1" style={{ top: '38%', left: '43%' }}>
                <p className="font-bold text-[10px] text-[#1d1b20] whitespace-nowrap">바다뷰 카페 파도</p>
                <p className="font-normal text-[9px] text-[#888] whitespace-nowrap">아메리카노 30% 할인</p>
              </div>
              {/* Pay button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button className="bg-[#0570db] flex gap-2 items-center px-5 py-2 rounded-full drop-shadow-md">
                  <p className="font-bold text-[13px] text-white whitespace-nowrap">결제하고 할인받기</p>
                  <div className="bg-[#ff6b6b] rounded-full size-5 flex items-center justify-center">
                    <p className="font-black text-[10px] text-white">4</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 내 쿠폰함 */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-[14px] text-[#1d1b20]">내 쿠폰함</p>
            <p className="font-normal text-[12px] text-[#0570db]">전체보기</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {freshAccount ? <p className="bg-white rounded-[24px] p-4 text-[12px] text-[#7b8796] w-full">보유한 쿠폰이 없습니다.</p> : [
              { emoji: '🛒', iconBg: 'rgba(5,112,219,0.09)', title: 'GS25 3천원 할인쿠폰', expiry: '~2026.09.30', btnColor: '#0570db' },
              { emoji: '👟', iconBg: 'rgba(29,27,32,0.09)', title: '나이키 10% 할인코드', expiry: '~2026.11.15', btnColor: '#1d1b20' },
            ].map((coupon, i) => (
              <div key={i} className="bg-white drop-shadow flex flex-col items-start p-4 rounded-[24px] shrink-0 w-[140px]">
                <div className="rounded-full size-9 flex items-center justify-center mb-3" style={{ backgroundColor: coupon.iconBg }}>
                  <span className="text-[18px]">{coupon.emoji}</span>
                </div>
                <p className="font-bold text-[12px] text-[#1d1b20] leading-[16.8px] mb-1">{coupon.title}</p>
                <p className="font-normal text-[10px] text-[#999] mb-3">{coupon.expiry}</p>
                <button className="w-full py-1 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: coupon.btnColor }}>
                  <p className="font-bold text-[11px] text-white">사용하기</p>
                </button>
              </div>
            ))}
            {/* Add coupon */}
            <div className="bg-[#f0f6ff] border border-dashed border-[#9fc7f9] flex flex-col items-center justify-center p-4 rounded-[24px] shrink-0 w-[140px]">
              <p className="text-[30px] leading-9 mb-2">+</p>
              <p className="font-normal text-[11px] text-[#0570db] text-center">쿠폰 추가하기</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="benefits" onTabChange={(tab) => {
        if (tab === 'home') onNavigate('home');
        else if (tab === 'courses') onNavigate('courses');
        else if (tab === 'records') onNavigate('records');
        else if (tab === 'esg') onNavigate('esg');
      }} />
    </div>
  );
}
