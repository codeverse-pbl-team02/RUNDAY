import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  photo: File | null;
  onPhotoChange: (photo: File) => void;
  description: string;
  heightClassName: string;
  tone: 'green' | 'purple';
  filenamePrefix: string;
}

const tones = {
  green: { button: 'bg-[rgba(25,170,3,0.19)] text-[#168604]', menu: 'bg-[#e5f5eb] text-[#168604]' },
  purple: { button: 'bg-[rgba(128,89,255,0.19)] text-[#8059ff]', menu: 'bg-[#eee9ff] text-[#8059ff]' },
};

export default function PhotoCapturePicker({ photo, onPhotoChange, description, heightClassName, tone, filenamePrefix }: Props) {
  const albumInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!photo) { setPhotoUrl(null); return; }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('이 브라우저에서 카메라를 사용할 수 없습니다. 기기 촬영 버튼을 이용해 주세요.');
        return;
      }
      try {
        const opened = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) { opened.getTracks().forEach(track => track.stop()); return; }
        stream = opened;
        if (video.current) {
          video.current.srcObject = opened;
          await video.current.play();
        }
      } catch {
        stream?.getTracks().forEach(track => track.stop());
        stream = null;
        if (!cancelled) setCameraError('카메라를 열 수 없습니다. 권한을 확인하거나 기기 촬영 버튼을 이용해 주세요.');
      }
    }
    void startCamera();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach(track => track.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, [cameraOpen]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    if (!selected.type.startsWith('image/') && !/\.(jpe?g|png|webp|heic|heif|gif)$/i.test(selected.name)) {
      setFileError('이미지 파일을 선택해 주세요.');
      return;
    }
    setFileError('');
    onPhotoChange(selected);
  }

  function capturePhoto() {
    const currentVideo = video.current;
    if (!currentVideo?.videoWidth || !currentVideo.videoHeight) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1200 / currentVideo.videoWidth);
    canvas.width = Math.round(currentVideo.videoWidth * scale);
    canvas.height = Math.round(currentVideo.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) { setCameraError('사진을 만들지 못했습니다. 다시 촬영해 주세요.'); return; }
    context.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) { setCameraError('사진을 만들지 못했습니다. 다시 촬영해 주세요.'); return; }
      onPhotoChange(new File([blob], `${filenamePrefix}-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      setFileError('');
      setCameraOpen(false);
    }, 'image/jpeg', 0.9);
  }

  const portalRoot = typeof document === 'undefined' ? null : document.getElementById('root');
  return <>
    <input ref={albumInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={choosePhoto} aria-label="앨범에서 사진 선택" />
    <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} onChange={choosePhoto} aria-label="기기 카메라로 촬영" />
    <div className={`border-2 border-black border-dashed rounded-[24px] ${heightClassName} flex flex-col items-center justify-center mb-6 relative overflow-hidden`}>
      {photoUrl ? <img src={photoUrl} alt="선택한 인증 사진 미리보기" className="absolute inset-0 w-full h-full object-contain bg-[#e4edf5]" /> : <>
        <p className="font-bold text-[12px] text-black text-center">사진 촬영 또는 업로드</p>
        <p className="font-bold text-[10px] text-[#7b8796] text-center mt-1">{description}</p>
      </>}
      <button type="button" onClick={() => setPickerOpen(true)} className={`${photoUrl ? 'absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90' : `mt-3 ${tones[tone].button}`} h-[38px] px-8 rounded-[18px] z-10`}>
        <span className={`font-bold text-[12px] ${photoUrl ? (tone === 'green' ? 'text-[#168604]' : 'text-[#8059ff]') : ''}`}>{photoUrl ? '사진 변경' : '선택'}</span>
      </button>
    </div>
    {fileError && <p role="alert" className="text-[12px] text-red-600 -mt-4 mb-4">{fileError}</p>}

    {portalRoot && pickerOpen && createPortal(<div className="absolute inset-0 z-[70] bg-black/40 flex items-end" onClick={() => setPickerOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="사진 선택" className="w-full rounded-t-[24px] bg-white px-4 pt-5 pb-6 flex flex-col gap-3" onClick={event => event.stopPropagation()}>
        <p className="text-[16px] font-bold text-[#0d1b2e] text-center mb-1">인증 사진 선택</p>
        <button type="button" onClick={() => { setPickerOpen(false); setCameraError(''); setCameraReady(false); setCameraOpen(true); }} className={`h-12 rounded-[16px] font-bold ${tones[tone].menu}`}>📷 사진 촬영</button>
        <button type="button" onClick={() => { setPickerOpen(false); albumInput.current?.click(); }} className="h-12 rounded-[16px] bg-[#edf4fb] text-[#0570db] font-bold">🖼️ 앨범에서 선택</button>
        <button type="button" onClick={() => setPickerOpen(false)} className="h-10 text-[#7b8796]">취소</button>
      </div>
    </div>, portalRoot)}

    {portalRoot && cameraOpen && createPortal(<div role="dialog" aria-modal="true" aria-label="사진 촬영" className="absolute inset-0 z-[80] bg-[#0d1b2e] flex flex-col">
      <div className="h-14 px-4 flex items-center justify-between text-white">
        <button type="button" onClick={() => setCameraOpen(false)} className="p-2" aria-label="카메라 닫기">✕</button>
        <p className="font-bold">사진 촬영</p>
        <span className="w-8" />
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        {cameraError ? <p role="alert" className="text-white text-[13px] px-6 text-center">{cameraError}</p> : <video ref={video} autoPlay muted playsInline onLoadedMetadata={() => setCameraReady(true)} className="w-full h-full object-contain" />}
      </div>
      <div className="p-5 flex flex-col gap-3">
        {!cameraError && <button type="button" disabled={!cameraReady} onClick={capturePhoto} className="h-12 rounded-full bg-white text-[#0d1b2e] font-bold disabled:opacity-50">촬영하기</button>}
        <button type="button" onClick={() => { setCameraOpen(false); cameraInput.current?.click(); }} className="h-10 text-white/80 text-[12px]">기기 카메라로 촬영</button>
      </div>
    </div>, portalRoot)}
  </>;
}
