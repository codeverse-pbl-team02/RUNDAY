import { useEffect, useState } from 'react';
import { brandLogo } from '../lib/assets';
import type { Screen } from '../App';
import type { PloggingSubmission } from './ploggingTypes';

interface Props {
  onNavigate: (screen: Screen) => void;
  submission: PloggingSubmission;
}

export default function PloggingCompleteScreen({ onNavigate, submission }: Props) {
  const [photoUrl, setPhotoUrl] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(submission.photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [submission.photo]);
  return (
    <div className="flex flex-col h-full relative bg-[#edf4fb]">
      {/* Header */}
      <div className="flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
        <button onClick={() => onNavigate('esg')} className="size-6 flex items-center justify-center shrink-0">
          <img alt="" className="size-full" src="/assets/c4f3a.svg" />
        </button>
        <div className="flex-1 flex justify-center">
          <img alt="" className="h-9 object-contain" src={brandLogo} />
        </div>
        <button className="size-[22px] overflow-clip relative shrink-0">
          <img alt="" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
        </button>
      </div>

      <div className="px-5 pb-4 shrink-0">
        <p className="font-bold text-[18px] text-black">♻️ 플로깅 인증하기</p>
        <p className="font-normal text-[12px] text-[#7b8796] mt-1">인증 챌린지 코스</p>
        <p className="font-bold text-[14px] text-[#60aedd] leading-[24px]">🌊 {submission.challengeTitle}</p>
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
        <p className="font-bold text-[12px] text-[#4cb57d] mb-5 text-center">선택한 사진과 수거 정보를 확인해 주세요.</p>

        {/* Submitted details */}
        <div className="w-full bg-white border border-[#dce3f1] rounded-[24px] px-4 py-4 mb-6">
          {photoUrl && <img src={photoUrl} alt="등록한 플로깅 인증 사진" className="w-full h-40 object-contain bg-[#edf4fb] rounded-[16px] mb-3" />}
          <div className="flex justify-between items-center py-2 border-b border-[#f0f4f8]">
            <p className="font-normal text-[12px] text-[#7b8796]">수거량</p>
            <p className="font-bold text-[12px] text-black">{submission.weightKg.toFixed(1)} kg</p>
          </div>
          <div className="flex justify-between items-start gap-3 py-2">
            <p className="font-normal text-[12px] text-[#7b8796] shrink-0">종류</p>
            <p className="font-bold text-[12px] text-black text-right break-keep">{submission.trashTypes.join(', ')}</p>
          </div>
        </div>
        <p className="text-[11px] text-[#7b8796] mb-4 text-center">사진과 수거 정보는 아직 계정에 저장되지 않습니다.</p>

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
