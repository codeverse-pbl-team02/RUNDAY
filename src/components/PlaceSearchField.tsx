import { useEffect, useRef, useState } from 'react';
import { searchPlaces, type PlaceChoice } from '../lib/kakaoMap';
import type { RouteEndpoint } from '../routing/types';

export function PlaceSearchField({ label, value, onChange }: {
  label: string; value: RouteEndpoint | null; onChange: (value: RouteEndpoint | null) => void;
}) {
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState<PlaceChoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const version = useRef(0);
  useEffect(() => () => { version.current++; }, []);
  async function search() {
    if (query.trim().length < 2 || busy) return;
    const request = ++version.current;
    setBusy(true); setMessage(''); setResults([]);
    try {
      const places = await searchPlaces(query);
      if (request !== version.current) return;
      setResults(places);
      if (!places.length) setMessage('검색 결과가 없습니다. 장소명이나 주소를 바꿔 주세요.');
    } catch { if (request === version.current) setMessage('장소를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { if (request === version.current) setBusy(false); }
  }
  return <div className="flex flex-col gap-2">
    <label className="text-[13px] font-bold text-[#0d1b2e]">
      {label}
      <span className="mt-1 flex gap-2">
        <input value={query} maxLength={100} autoComplete="off" placeholder="장소명 또는 주소 검색"
          className="min-w-0 flex-1 rounded-xl border border-[#dce3f1] bg-white px-3 py-3 text-[13px] font-normal outline-none focus:border-[#0570db]"
          onChange={event => { version.current++; setBusy(false); setQuery(event.target.value); setResults([]); setMessage(''); onChange(null); }}
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} />
        <button type="button" disabled={busy || query.trim().length < 2} onClick={() => void search()}
          className="shrink-0 rounded-xl bg-[#edf4fb] px-3 text-[12px] text-[#0570db] disabled:opacity-50">{busy ? '검색 중' : '검색'}</button>
      </span>
    </label>
    {value && <p className="text-[11px] text-[#0570db]">✓ 선택됨 · {value.label}</p>}
    {message && <p role="status" className="text-[12px] text-[#7b8796]">{message}</p>}
    {results.length > 0 && <ul aria-label={`${label} 검색 결과`} className="max-h-52 overflow-y-auto rounded-xl border border-[#dce3f1] bg-white">
      {results.map((place, index) => <li key={`${place.latitude}:${place.longitude}:${index}`}>
        <button type="button" onClick={() => { version.current++; onChange(place); setQuery(place.label); setResults([]); setMessage(''); }}
          className="w-full border-b border-[#edf4fb] px-3 py-3 text-left last:border-b-0">
          <span className="block text-[13px] font-bold text-[#0d1b2e]">{place.label}</span>
          <span className="block text-[11px] text-[#7b8796]">{place.address}</span>
        </button>
      </li>)}
    </ul>}
  </div>;
}
