import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function PloggingCompleteScreen({ onNavigate }: Props) {
  return (
    <div className="flex flex-col h-full relative bg-[#edf4fb]">
      {/* Header */}
      <div className="flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
        <button onClick={() => onNavigate('esg')} className="size-6 flex items-center justify-center shrink-0">
          <img alt="" className="size-full" src="/assets/c4f3a.svg" />
        </button>
        <div className="flex-1 flex justify-center">
          <img alt="" className="h-9 object-contain" src="/assets/9065b.png" />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      <div className="px-5 pb-4 shrink-0">
        <p className="font-bold text-[18px] text-black">♻️ 플로깅 인증하기</p>
        <p className="font-normal text-[12px] text-[#7b8796] mt-1">인증 챌린지 코스</p>
        <p className="font-bold text-[14px] text-[#60aedd] leading-[24px]">🌊 광안리 해안 플로깅</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4 px-4 flex flex-col items-center">
        {/* Tree icon */}
        <div
          className="w-[61px] h-[61px] rounded-full border border-[#dce3f1] flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(255,184,0,0.41)' }}
        >
          <span className="text-[30px]">🌳</span>
        </div>

        <p className="font-bold text-[18px] text-black mb-2">인증 완료!</p>
        <p className="font-bold text-[12px] text-[#4cb57d] mb-3 text-center">초록빛 부산 만들기에 동참해주셨습니다.</p>

        <div className="bg-white border border-[#dce3f1] rounded-full px-4 py-1 mb-6">
          <p className="font-bold text-[12px] text-[rgba(0,0,0,0.6)]">[ 플로거 ] 배지 획득 🎖️</p>
        </div>

        {/* Rewards card */}
        <div className="w-full bg-white border border-[#dce3f1] rounded-[24px] px-4 py-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[#f0f4f8]">
            <p className="font-normal text-[12px] text-[#7b8796]">획득 보상</p>
            <p className="font-bold text-[12px] text-[#4cb57d]">+100 그린 마일리지</p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f0f4f8]">
            <p className="font-normal text-[12px] text-[#7b8796]">지구 구하기</p>
            <p className="font-bold text-[12px] text-[#4cb57d]">- 0.11 kg CO₂ 절감</p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f0f4f8]">
            <p className="font-normal text-[12px] text-[#7b8796]">수거량</p>
            <p className="font-bold text-[12px] text-black">0.5 kg</p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="font-normal text-[12px] text-[#7b8796]">종류</p>
            <p className="font-bold text-[12px] text-black">기타 쓰레기</p>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={() => onNavigate('esg')}
          className="w-full h-[50px] rounded-[18px] bg-[#0570db] flex items-center justify-center"
          style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)' }}
        >
          <p className="font-bold text-[14px] text-white">확인</p>
        </button>
      </div>
    </div>
  );
}
