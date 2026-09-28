import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function DogVerifyScreen({ onNavigate }: Props) {
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

      <div className="px-5 pb-2 shrink-0">
        <p className="font-bold text-[18px] text-black">🐕 반려견 인증</p>
        <p className="font-normal text-[12px] text-[#7b8796] mt-1" style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>반려견과 함께한 러닝을 인증해보세요!</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4 px-4">
        <p className="font-bold text-[12px] text-black mb-3 mt-2">인증 사진 등록</p>

        {/* Photo upload box */}
        <div className="border-2 border-black border-dashed rounded-[24px] h-[191px] flex flex-col items-center justify-center mb-6">
          <p className="font-bold text-[12px] text-black text-center">사진 촬영 또는 업로드</p>
          <p className="font-bold text-[10px] text-[#7b8796] text-center mt-1">러닝을 함께한 반려견 사진을 올려주세요</p>
          <button className="mt-3 h-[38px] px-8 rounded-[18px]" style={{ backgroundColor: 'rgba(128,89,255,0.19)' }}>
            <p className="font-bold text-[12px] text-[#8059ff]">선택</p>
          </button>
        </div>

        {/* Badge info card */}
        <div className="bg-white border border-[#dce3f1] rounded-[16px] p-4 flex items-center gap-4 mb-6"
          style={{ boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.1)' }}>
          <div
            className="w-[48px] h-[48px] rounded-[18px] flex items-center justify-center shrink-0 border border-black"
            style={{ backgroundColor: 'rgba(193,193,193,0.3)' }}
          >
            <span className="text-[24px]">🐾</span>
          </div>
          <div>
            <p className="font-bold text-[12px] text-black mb-1">반려견 파트너 배지 획득</p>
            <p className="font-normal text-[11px] text-[#7b8796]">인증 완료 시 반려견 파트너 배지가 지급됩니다.</p>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={() => onNavigate('dog-complete')}
          className="w-full h-[50px] rounded-[18px] bg-[#0570db] flex items-center justify-center"
          style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)' }}
        >
          <p className="font-bold text-[14px] text-white">인증 완료하기</p>
        </button>
      </div>
    </div>
  );
}
