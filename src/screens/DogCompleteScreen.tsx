import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function DogCompleteScreen({ onNavigate }: Props) {
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
        <p className="font-normal text-[12px] text-[#7b8796] mt-1">반려견 동반 드로잉런 인증 완료!</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto pb-4 px-3">
        <p className="font-bold text-[12px] text-black mb-2 px-1">인증 사진 등록</p>

        {/* Dog photo with run stats overlay */}
        <div className="relative rounded-[24px] overflow-hidden mb-4" style={{ height: 280 }}>
          <img
            src="/assets/f04d6.png"
            alt="반려견 인증 사진"
            className="w-full h-full object-cover"
          />
          {/* Dashed border overlay */}
          <div className="absolute inset-0 border-2 border-black border-dashed rounded-[24px]" />

          {/* Bottom stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
            {/* Distance */}
            <div className="mb-2">
              <p className="font-bold text-[32px] text-white leading-none tracking-[-0.8px]">5.01</p>
              <p className="text-[11px] text-white/80 font-medium">킬로미터</p>
            </div>
            {/* Row 1 */}
            <div className="flex justify-around border-t border-white/30 pt-2 mb-1">
              {[{ val: "5'03\"", label: '페이스' }, { val: '25:19', label: '시간' }, { val: '365', label: '칼로리' }].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-[13px] text-white leading-tight">{s.val}</p>
                  <p className="text-[9px] text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex justify-around border-t border-white/30 pt-1">
              {[{ val: '25 m', label: '고도 상승' }, { val: '-- ♡', label: '평균 심박수' }, { val: '178', label: '케이던스' }].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-[13px] text-white leading-tight">{s.val}</p>
                  <p className="text-[9px] text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2 mb-4">
          {[
            { val: '5.01km', label: '거리' },
            { val: '25:19', label: '시간' },
            { val: "5'03\"", label: '평균' },
            { val: '365', label: '칼로리' },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white border border-[#dce3f1] rounded-[24px] py-3 flex flex-col items-center shadow-sm">
              <p className="font-bold text-[11px] text-black">{s.val}</p>
              <p className="font-normal text-[10px] text-[#7b8796]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* AI analysis card */}
        <div className="bg-white border border-[#dce3f1] rounded-[24px] px-4 py-4 mb-4 shadow-sm">
          <p className="font-bold text-[14px] text-black mb-2">AI 러닝 구간 분석</p>
          <p className="font-normal text-[12px] text-[#7b8796] leading-[18px]">
            반려견 동반 구간에서 페이스가 안정적으로 유지되었으며, 전반적으로 심박수가 이상적인 범위에서 유지되었습니다.
          </p>
        </div>

        {/* Badge card */}
        <div className="bg-white border border-[#dce3f1] rounded-[24px] px-4 py-4 mb-4 shadow-sm flex flex-col items-center">
          <div
            className="w-[48px] h-[48px] rounded-[16px] flex items-center justify-center border border-black mb-3"
            style={{ backgroundColor: 'rgba(193,193,193,0.3)' }}
          >
            <span className="text-[24px]">🐾</span>
          </div>
          <p className="font-bold text-[14px] text-black mb-1">반려견 파트너 배지 획득!</p>
          <p className="font-bold text-[12px] text-[#4cb57d]">반려견과 함께 완주했습니다</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => onNavigate('esg')}
            className="flex-1 h-[44px] rounded-[16px] flex items-center justify-center"
            style={{ backgroundColor: '#8059ff', boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.1)' }}
          >
            <p className="font-bold text-[12px] text-white">SNS 공유</p>
          </button>
          <button
            className="flex-1 h-[44px] rounded-[16px] flex items-center justify-center"
            style={{ backgroundColor: '#52c480', boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.1)' }}
          >
            <p className="font-bold text-[12px] text-white">인증샷 저장</p>
          </button>
        </div>
      </div>
    </div>
  );
}
