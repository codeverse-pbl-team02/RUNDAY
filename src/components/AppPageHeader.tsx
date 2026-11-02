import { brandLogo } from '../lib/assets';

export default function AppPageHeader({ onBack }: { onBack: () => void }) {
  return <header className="flex h-[56px] shrink-0 items-center gap-1 px-3">
    <button type="button" onClick={onBack} aria-label="홈으로 돌아가기" className="flex size-6 shrink-0 items-center justify-center">
      <img src="/assets/c4f3a.svg" alt="" className="size-full" />
    </button>
    <div className="flex flex-1 justify-center">
      <img src={brandLogo} alt="뛴데이" className="h-9 object-contain" />
    </div>
    <button type="button" aria-label="알림" className="relative size-[22px] shrink-0 overflow-clip">
      <img src="/assets/08bbd.svg" alt="" className="absolute inset-0 size-full" />
    </button>
  </header>;
}
