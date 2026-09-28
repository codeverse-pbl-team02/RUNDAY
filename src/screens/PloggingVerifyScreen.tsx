import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function PloggingVerifyScreen({ onNavigate }: Props) {
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
        <p className="font-bold text-[14px] text-[#be7e00] leading-[24px]">🌊 광안리 해안 플로깅</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto pb-4 px-4">
        {/* Photo upload */}
        <p className="font-bold text-[14px] text-black mb-3">인증 사진 등록</p>
        <div className="border-2 border-black border-dashed rounded-[24px] h-[133px] flex flex-col items-center justify-center mb-6 relative">
          <p className="font-bold text-[12px] text-black text-center">사진 촬영 또는 업로드</p>
          <p className="font-black text-[10px] text-[#7b8796] text-center mt-1">수거한 쓰레기 사진을 올려주세요</p>
          <button className="mt-3 h-[38px] px-8 rounded-[18px] bg-[rgba(25,170,3,0.19)]">
            <p className="font-bold text-[12px] text-[#168604]">선택</p>
          </button>
        </div>

        {/* Weight slider */}
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-[14px] text-black">수거한 쓰레기 무게</p>
          <div className="bg-[rgba(76,181,125,0.2)] rounded-[3px] px-2 py-0.5">
            <p className="font-bold text-[12px] text-[#4cb57d]">0 kg</p>
          </div>
        </div>

        {/* Slider track */}
        <div className="relative mb-1">
          <div className="w-full h-[6px] bg-[#f8f9fa] rounded-full" />
          <div className="absolute top-[-2.5px] left-0 w-3 h-3 bg-[#4cb57d] rounded-full" />
        </div>
        <div className="flex justify-between mb-6">
          <p className="font-normal text-[10px] text-[#7b8796]">0.1kg</p>
          <p className="font-normal text-[10px] text-[#7b8796]">2.5kg</p>
          <p className="font-normal text-[10px] text-[#7b8796]">5.0kg</p>
        </div>

        {/* Trash type selection */}
        <p className="font-bold text-[14px] text-black mb-3">수거한 쓰레기 종류 (중복 선택)</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {['플라스틱', '일반쓰레기', '담배꽁초', '캔 / 유리 / 페트', '비닐', '기타'].map((item) => (
            <button
              key={item}
              className="h-[34px] rounded-[18px] bg-white border border-[#dce3f1] flex items-center justify-center"
            >
              <p className="font-black text-[12px] text-[#7b8796]">{item}</p>
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => onNavigate('plogging-complete')}
          className="w-full h-[50px] rounded-[18px] bg-[#0570db] flex items-center justify-center"
          style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)' }}
        >
          <p className="font-bold text-[14px] text-white">인증 완료하기</p>
        </button>
      </div>
    </div>
  );
}
