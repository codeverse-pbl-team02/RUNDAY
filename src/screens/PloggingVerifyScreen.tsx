import { useState } from 'react';
import { brandLogo } from '../lib/assets';
import PhotoCapturePicker from '../components/PhotoCapturePicker';
import type { Screen } from '../App';
import type { PloggingSubmission } from './ploggingTypes';

interface Props {
  onNavigate: (screen: Screen) => void;
  onComplete: (submission: PloggingSubmission) => void;
  challengeTitle: string;
}

const trashOptions = ['플라스틱', '일반쓰레기', '담배꽁초', '캔 / 유리 / 페트', '비닐', '기타'];

export default function PloggingVerifyScreen({ onNavigate, onComplete, challengeTitle }: Props) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [weightKg, setWeightKg] = useState(0);
  const [trashTypes, setTrashTypes] = useState<string[]>([]);
  const [error, setError] = useState('');

  function toggleTrashType(item: string) {
    setTrashTypes(current => current.includes(item) ? current.filter(type => type !== item) : [...current, item]);
    setError('');
  }

  function submit() {
    if (!photo) { setError('인증 사진을 촬영하거나 앨범에서 선택해 주세요.'); return; }
    if (weightKg < 0.1) { setError('수거한 쓰레기 무게를 선택해 주세요.'); return; }
    if (!trashTypes.length) { setError('수거한 쓰레기 종류를 하나 이상 선택해 주세요.'); return; }
    onComplete({ challengeTitle, photo, weightKg, trashTypes });
  }

  return <div className="flex flex-col h-full relative bg-[#edf4fb]">
    <div className="flex h-[56px] items-center px-3 shrink-0 w-full gap-1">
      <button type="button" onClick={() => onNavigate('esg')} className="size-6 flex items-center justify-center shrink-0">
        <img alt="뒤로" className="size-full" src="/assets/c4f3a.svg" />
      </button>
      <div className="flex-1 flex justify-center"><img alt="뛴데이" className="h-9 object-contain" src={brandLogo} /></div>
      <button type="button" className="size-[22px] overflow-clip relative shrink-0">
        <img alt="" className="absolute inset-0 size-full" src="/assets/08bbd.svg" />
      </button>
    </div>

    <div className="px-5 pb-4 shrink-0">
      <p className="font-bold text-[18px] text-black">♻️ 플로깅 인증하기</p>
      <p className="font-normal text-[12px] text-[#7b8796] mt-1">인증 챌린지 코스</p>
      <p className="font-bold text-[14px] text-[#be7e00] leading-[24px]">🌊 {challengeTitle}</p>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto pb-4 px-4">
      <p className="font-bold text-[14px] text-black mb-3">인증 사진 등록</p>
      <PhotoCapturePicker photo={photo} onPhotoChange={file => { setPhoto(file); setError(''); }} description="수거한 쓰레기 사진을 올려주세요" heightClassName="h-[133px]" tone="green" filenamePrefix="plogging" />

      <div className="flex items-center justify-between mb-1">
        <label htmlFor="plogging-weight" className="font-bold text-[14px] text-black">수거한 쓰레기 무게</label>
        <div className="bg-[rgba(76,181,125,0.2)] rounded-[3px] px-2 py-0.5">
          <p className="font-bold text-[12px] text-[#4cb57d]">{weightKg === 0 ? '0 kg' : `${weightKg.toFixed(1)} kg`}</p>
        </div>
      </div>
      <input id="plogging-weight" type="range" min="0" max="5" step="0.1" value={weightKg}
        onChange={event => { setWeightKg(Number(event.target.value)); setError(''); }}
        aria-valuetext={`${weightKg.toFixed(1)} 킬로그램`}
        className="plogging-weight-slider w-full"
        style={{ background: `linear-gradient(to right, #4cb57d ${weightKg * 20}%, #f8f9fa ${weightKg * 20}%)` }}
      />
      <div className="flex justify-between mb-6">
        <p className="font-normal text-[10px] text-[#7b8796]">0 kg</p>
        <p className="font-normal text-[10px] text-[#7b8796]">2.5 kg</p>
        <p className="font-normal text-[10px] text-[#7b8796]">5.0 kg</p>
      </div>

      <p className="font-bold text-[14px] text-black mb-3">수거한 쓰레기 종류 (중복 선택)</p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {trashOptions.map(item => {
          const selected = trashTypes.includes(item);
          return <button key={item} type="button" aria-pressed={selected} onClick={() => toggleTrashType(item)}
            className={`h-[34px] rounded-[18px] border flex items-center justify-center ${selected ? 'bg-[#e5f5eb] border-[#4cb57d] text-[#168604]' : 'bg-white border-[#dce3f1] text-[#7b8796]'}`}>
            <span className="font-black text-[12px]">{selected ? '✓ ' : ''}{item}</span>
          </button>;
        })}
      </div>

      {error && <p role="alert" className="text-[12px] text-red-600 mb-3">{error}</p>}
      <button type="button" onClick={submit} className="w-full h-[50px] rounded-[18px] bg-[#0570db] flex items-center justify-center" style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)' }}>
        <span className="font-bold text-[14px] text-white">인증 완료하기</span>
      </button>
    </div>
  </div>;
}
