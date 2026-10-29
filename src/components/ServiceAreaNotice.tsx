export function ServiceAreaNotice({ onBrowseCourses }: { onBrowseCourses: () => void }) {
  return <div role="status" className="rounded-2xl border border-[#f5d48a] bg-white/95 px-3 py-2 shadow-md">
    <p className="text-[12px] font-bold text-[#704b00]">📍 현재 부산 외 지역입니다.</p>
    <p className="mt-1 text-[11px] leading-relaxed text-[#4a6080]">부산 지역 코스만 제공하여 현위치 기반 추천을 이용할 수 없습니다.</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
      <span className="text-[10px] text-[#7b8796]">자유 러닝은 이용할 수 있습니다.</span>
      <button type="button" onClick={onBrowseCourses} className="rounded-full bg-[#0570db] px-3 py-2 text-[11px] font-bold text-white">부산 코스 둘러보기</button>
    </div>
  </div>;
}
