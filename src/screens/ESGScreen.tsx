import { brandLogo } from '../lib/assets';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function ESGScreen({ onNavigate }: Props) {
  return (
    <div className="flex flex-col h-full relative bg-[#edf4fb]">
      {/* Header */}
      <div className="flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
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


      <div className="px-5 pb-3 shrink-0">
        <p className="font-bold text-[18px] text-black">ESG - CHALLENGE</p>
        <p className="font-normal text-[12px] text-[#7b8796]" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>같이 만드는 더 나은 부산</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[72px]">

        {/* 지구 지킴이 리포트 card */}
        <div className="mx-4 mb-4 rounded-[24px] border border-[#dce3f1] shadow-sm overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(247,255,244,0.6) 0%, rgba(236,255,228,0.6) 50%, rgba(232,255,222,0.6) 100%)' }}>
          <div className="p-4">
            <p className="font-black text-[12px] text-[#4cb57d] mb-3">🌍 지구 지킴이 리포트</p>
            <div className="mb-3">
              <p className="font-bold text-[18px] text-black leading-[28px]">
                오늘 <span className="text-[#3b91c1]">4.2km</span>를 걸어
              </p>
              <p className="font-bold text-[18px] text-black leading-[28px]">
                자동차 대비 <span className="text-[#4cb57d]">0.9kg CO₂</span> 절감
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="font-bold text-[14px] text-[#3b91c1] leading-[20px]">18.4kg</p>
                <p className="font-medium text-[12px] text-[#7b8796]">이번달 절감</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[14px] text-[#4cb57d] leading-[20px]">🌳 2그루</p>
                <p className="font-medium text-[12px] text-[#7b8796]">나무 효과</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[14px] text-[#60aedd] leading-[20px]">247km</p>
                <p className="font-medium text-[12px] text-[#7b8796]">누적 거리</p>
              </div>
            </div>
          </div>
        </div>

        {/* PLOGGING card */}
        <div className="mx-4 mb-4 bg-white border border-[#dce3f1] rounded-[24px] overflow-hidden">
          {/* Header row */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(22,134,4,0.1)] rounded-[16px] flex items-center justify-center shrink-0">
              <span className="text-[20px]">♻️</span>
            </div>
            <div>
              <div className="inline-block bg-[rgba(22,134,4,0.15)] rounded-full px-3 py-0.5 mb-1">
                <p className="font-bold text-[12px] text-[#1b7a47]">PLOGGING</p>
              </div>
              <p className="font-bold text-[14px] text-black">랜드마크 플로깅 챌린지</p>
              <p className="font-normal text-[12px] text-[#7b8796] leading-[16px]">아름다운 부산을 달리며 쓰레기도 줍고, 상쾌한 지구를 함께 만들어요!</p>
            </div>
          </div>

          {/* Challenge rows */}
          <div className="border-t border-[#dfdfdf] px-4 py-3 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <div className="bg-[rgba(253,200,95,0.5)] rounded-full px-2 py-0.5 shrink-0">
                <p className="font-bold text-[10px] text-[#be7e00]">진행중</p>
              </div>
              <div>
                <p className="font-bold text-[14px] text-black">🌊 광안리 해안 플로깅</p>
                <p className="font-normal text-[12px] text-[#7b8796]">834명 참여중</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('plogging-verify')}
              className="h-[38px] px-4 rounded-[18px] bg-[rgba(25,170,3,0.19)]"
            >
              <p className="font-bold text-[12px] text-[#168604]">인증하기</p>
            </button>
          </div>

          <div className="border-t border-[#dfdfdf] px-4 py-3 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <div className="bg-[rgba(253,200,95,0.5)] rounded-full px-2 py-0.5 shrink-0">
                <p className="font-bold text-[10px] text-[#be7e00]">진행중</p>
              </div>
              <div>
                <p className="font-bold text-[14px] text-black">🏖️ 해운대 비치 클린</p>
                <p className="font-normal text-[12px] text-[#7b8796]">612명 참여중</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('plogging-verify')}
              className="h-[38px] px-4 rounded-[18px] bg-[rgba(25,170,3,0.19)]"
            >
              <p className="font-bold text-[12px] text-[#168604]">인증하기</p>
            </button>
          </div>

          <div className="border-t border-[#dfdfdf] px-4 py-3 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <div className="bg-[rgba(0,26,255,0.15)] rounded-full px-2 py-0.5 shrink-0">
                <p className="font-bold text-[10px] text-[#001aff]">D-3</p>
              </div>
              <div>
                <p className="font-bold text-[14px] text-black">🗼 부산타워 둘레 플로깅</p>
                <p className="font-normal text-[12px] text-[#7b8796]">0명 참여중</p>
              </div>
            </div>
            <button className="h-[38px] px-4 rounded-[18px] bg-[#d9d9d9] opacity-60">
              <p className="font-bold text-[12px] text-[#7b8796]">인증하기</p>
            </button>
          </div>

          {/* Stats */}
          <div className="border-t border-[#dfdfdf] px-4 py-4 flex">
            <div className="flex-1 text-center">
              <p className="font-bold text-[15px] text-[#7b8796] mb-1">이달 참여자</p>
              <p className="font-black text-[16px] text-[#4cb57d]">1,847명</p>
            </div>
            <div className="w-px bg-[#dfdfdf]" />
            <div className="flex-1 text-center">
              <p className="font-bold text-[15px] text-[#7b8796] mb-1">수거 쓰레기</p>
              <p className="font-black text-[16px] text-[#4cb57d]">2.3톤</p>
            </div>
          </div>
        </div>

        {/* CHALLENGE - 반려견 산책 card */}
        <div className="mx-4 mb-4 bg-white border border-[#dce3f1] rounded-[24px] overflow-hidden">
          <div className="px-4 pt-4 pb-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-[rgba(128,89,255,0.1)] rounded-[16px] flex items-center justify-center shrink-0">
              <span className="text-[20px]">🐕</span>
            </div>
            <div className="flex-1">
              <div className="inline-block bg-[rgba(128,89,255,0.15)] rounded-full px-3 py-0.5 mb-1">
                <p className="font-bold text-[12px] text-[#8059ff]">CHALLENGE</p>
              </div>
              <p className="font-bold text-[14px] text-black mb-1">반려견 산책 챌린지</p>
              <p className="font-normal text-[12px] text-[#7b8796] leading-[16px] mb-3">사랑하는 반려견과 발맞춰 걷는 꼬리 흔들 완주 미션!</p>
              <button
                onClick={() => onNavigate('dog-verify')}
                className="w-full h-[41px] rounded-[18px] flex items-center justify-center"
                style={{ backgroundColor: 'rgba(128,89,255,0.5)', boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)' }}
              >
                <p className="font-bold text-[14px] text-white">인증하고 배지 받기</p>
              </button>
            </div>
          </div>
        </div>

      </div>

      <BottomNav active="esg" onTabChange={(tab) => {
        if (tab === 'home') onNavigate('home');
        else if (tab === 'courses') onNavigate('courses');
        else if (tab === 'records') onNavigate('records');
        else if (tab === 'benefits') onNavigate('benefits');
      }} />
    </div>
  );
}
