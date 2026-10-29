import { useEffect, useRef, useState } from 'react';
import { sendChat, type ChatMessage, type ChatReply } from '../chatbot/client';
import { useBackAction } from '../navigation/useBackAction';
import { formatRecommendationPace, isRecommendationTrigger, makeRecommendation, recommendationQuestions, type RecommendationAnswers } from '../chatbot/recommendation';
import { getRecommendableCourses } from '../data/courses';

type Message = ChatMessage & { sources?: ChatReply['sources'] };
const suggestions = ['러닝 추천받기', '부산 러닝 코스 추천해줘', '출발·도착지로 경로는 어떻게 찾아?', '위치 오차가 크면 어떻게 해?'];
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState<{ step: number; answers: Partial<RecommendationAnswers> } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const active = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  function close() {
    if (!messages.length && !draft.trim() && !active.current) { leave(); return; }
    setConfirmClose(true);
  }
  function leave() {
    controller.current?.abort();
    controller.current = null;
    active.current = false;
    setBusy(false);
    setMessages([]);
    setDraft('');
    setError('');
    setRecommendation(null);
    setConfirmClose(false);
    setOpen(false);
    launcher.current?.focus();
  }
  useBackAction(open, () => { if (confirmClose) setConfirmClose(false); else close(); });
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    if (confirmClose) continueButton.current?.focus();
    else input.current?.focus();
  }, [open, confirmClose]);
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: 'nearest' }); }, [open, messages, busy, error, recommendation]);
  function addExchange(question: string, answer: string) {
    setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: answer }].slice(-40) as Message[]);
    setDraft(''); setError('');
  }
  function chooseRecommendation(value: string) {
    if (!recommendation) return;
    const current = recommendationQuestions[recommendation.step];
    const choice = current.options.find(option => option.value === value);
    if (!choice) return;
    const answers = { ...recommendation.answers, [current.key]: value };
    if (current.key === 'condition' && value === 'rest') {
      addExchange(choice.label, '오늘은 쉬는 날로 정해볼까요? 거리와 페이스 목표는 잡지 않을게요. 다음에 러닝 추천받기로 다시 시작할 수 있어요.');
      setRecommendation(null); return;
    }
    if (recommendation.step < recommendationQuestions.length - 1) {
      addExchange(choice.label, recommendationQuestions[recommendation.step + 1].question);
      setRecommendation({ step: recommendation.step + 1, answers }); return;
    }
    const plan = makeRecommendation(answers as RecommendationAnswers);
    if (!plan) return;
    const course = getRecommendableCourses().filter(c => Math.abs(c.distanceMeters / 1000 - plan.distanceKm) <= plan.distanceKm * 0.25)
      .sort((a,b) => Math.abs(a.distanceMeters / 1000 - plan.distanceKm) - Math.abs(b.distanceMeters / 1000 - plan.distanceKm))[0];
    const courseText = course ? `\n\n비슷한 거리의 등록 코스: ${course.title} (${(course.distanceMeters / 1000).toFixed(1)}km). 추천 거리와 코스 전체 거리는 다를 수 있어요. 코스 탐색에서 확인해 주세요.`
      : '\n\n추천 거리와 비슷한 등록 코스가 없어 특정 코스는 제안하지 않았어요. 경로 찾기에서 출발·도착지를 정해 실제 거리를 확인해 주세요.';
    addExchange(choice.label, `오늘의 ${plan.activity} 제안이에요!\n\n거리: 약 ${plan.distanceKm}km\n페이스: 1km당 ${formatRecommendationPace(plan.paceMinSeconds)}~${formatRecommendationPace(plan.paceMaxSeconds)}\n예상 시간: 약 ${plan.durationMin}~${plan.durationMax}분\n\n${plan.summary}\n선택한 값으로 만든 활동 예시예요. 몸이 불편하면 멈추고 쉬어주세요.${courseText}`);
    setRecommendation(null);
  }
  async function submit(value = draft) {
    const question = value.trim();
    if (!question || question.length > 800 || active.current) return;
    if (isRecommendationTrigger(question)) {
      addExchange(question, recommendationQuestions[0].question);
      setRecommendation({ step: 0, answers: {} }); return;
    }
    if (recommendation) {
      const options = recommendationQuestions[recommendation.step].options;
      const choice = options.find(option => option.label === question || option.value === question);
      if (choice) chooseRecommendation(choice.value);
      else setError('아래 선택 버튼으로 답해주세요. 일반 질문을 하려면 추천 그만하기를 눌러주세요.');
      return;
    }
    active.current = true; setBusy(true); setError('');
    const abort = new AbortController(); controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort('timeout'), 70_000);
    try {
      const reply = await sendChat(question, messages, abort.signal);
      if (!abort.signal.aborted) {
        setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: reply.answer, sources: reply.sources }].slice(-40) as Message[]);
        setDraft('');
      }
    } catch (failure) {
      if (!abort.signal.aborted || abort.signal.reason === 'timeout') setError(abort.signal.reason === 'timeout'
        ? '답변이 지연되고 있어요. 잠시 후 다시 시도해 주세요.'
        : failure instanceof Error && failure.name !== 'TypeError' ? failure.message : '연결 상태를 확인하고 다시 시도해 주세요.');
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) { active.current = false; setBusy(false); }
    }
  }
  return <>
    <button ref={launcher} type="button" aria-label="RUNDAY 챗봇 열기" aria-haspopup="dialog" aria-expanded={open}
      onClick={() => setOpen(true)} className="absolute right-3 bottom-[76px] z-40 flex size-[37px] items-center justify-center rounded-full bg-[#bde3f6] text-[#285b78] shadow-lg ring-2 ring-white">
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 5v3M4 13H2v6h2m20-6h2v6h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="3.5" r="1.8" fill="currentColor"/>
        <rect x="5" y="8" width="18" height="16" rx="5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="10" cy="14" r="1.6" fill="currentColor"/><circle cx="18" cy="14" r="1.6" fill="currentColor"/>
        <path d="M10 19c2 1.5 6 1.5 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
    {open && <div className="absolute inset-x-0 top-0 bottom-[125px] z-[70] flex items-end justify-end px-3 pt-3" onClick={close}>
      <div ref={panel} role="dialog" aria-modal={!confirmClose} aria-hidden={confirmClose || undefined} inert={confirmClose} aria-labelledby="chat-title" onClick={e => e.stopPropagation()}
        onKeyDown={e => {
          if (e.key === 'Escape') close();
          if (e.key === 'Tab') {
            const nodes = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled)');
            if (!nodes?.length) return;
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }} className="flex h-[min(576px,100%)] min-h-0 w-full max-w-[360px] flex-col overflow-hidden rounded-3xl bg-[#f4f8fd] shadow-xl">
        <header className="flex shrink-0 items-center justify-between bg-[#bde3f6] px-4 py-4 text-[#285b78]">
          <div><h2 id="chat-title" className="text-base font-bold">RUNDAY 도우미</h2><p className="mt-1 text-[11px] text-[#48718b]">앱 사용법부터 부산 코스까지</p></div>
          <button type="button" onClick={close} aria-label="대화창 닫기" className="size-10 rounded-full bg-white/40 text-xl">×</button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4" role="log" aria-live="polite" aria-relevant="additions">
          <div className="mb-4 rounded-2xl rounded-tl-sm bg-white p-3 text-[13px] leading-relaxed text-[#334963]">안녕하세요! RUNDAY 도우미예요. 앱 이용 방법과 등록된 부산 러닝 코스를 물어봐 주세요.</div>
          {!messages.length && <div className="mb-4 flex flex-col items-start gap-2">{suggestions.map(q => <button key={q} disabled={busy} onClick={() => { setDraft(q); void submit(q); }} className="rounded-2xl border border-blue-200 bg-white px-3 py-2 text-left text-xs text-[#0570db] disabled:opacity-50">{q}</button>)}</div>}
          {messages.map((m, i) => <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] rounded-2xl p-3 text-[13px] leading-relaxed ${m.role === 'user' ? 'rounded-tr-sm bg-[#0570db] text-white' : 'rounded-tl-sm bg-white text-[#334963]'}`}>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              {!!m.sources?.length && <div className="mt-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">참고한 앱 자료: {m.sources.map(s => s.title).join(' · ')}</div>}
            </div>
          </div>)}
          {recommendation && <div className="mb-3 rounded-2xl border border-[#d4e6f1] bg-white p-3">
            <p className="mb-2 text-[11px] text-[#61758c]">{recommendation.step + 1} / 3 · 선택해 주세요</p>
            <div className="flex flex-wrap gap-2">{recommendationQuestions[recommendation.step].options.map(option => <button type="button" key={option.value}
              onClick={() => chooseRecommendation(option.value)} className="rounded-full bg-[#e1f1fa] px-3 py-2 text-xs font-medium text-[#285b78]">{option.label}</button>)}</div>
            <button type="button" onClick={() => { setRecommendation(null); setError(''); setDraft(''); setMessages(prev => [...prev, {role:'assistant',content:'러닝 추천을 중단했어요. 다른 앱 질문을 해주세요.'}]); }} className="mt-3 text-[11px] text-slate-500 underline">추천 그만하기</button>
          </div>}
          {!recommendation && messages.length > 0 && !busy && <button type="button" onClick={() => { void submit('러닝 추천받기'); }} className="mb-3 rounded-full border border-[#bde3f6] bg-white px-3 py-2 text-xs text-[#285b78]">러닝 추천 다시 받기</button>}
          {busy && <p className="mb-3 text-xs text-slate-500" role="status">앱 자료를 확인하고 있어요…</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{error} 입력한 질문으로 다시 전송할 수 있어요.</p>}
          <div ref={bottom}/>
        </div>
        <form onSubmit={e => { e.preventDefault(); void submit(); }} className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea ref={input} aria-label="챗봇 질문" placeholder="RUNDAY에 대해 물어보세요" value={draft} readOnly={busy} maxLength={800} rows={2}
              onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void submit(); } }}
              className="min-w-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-[#f4f8fd] p-3 text-[13px] outline-none focus:border-blue-500"/>
            <button disabled={busy || !draft.trim()} className="rounded-2xl bg-[#0570db] px-3 py-3 text-xs font-bold text-white disabled:opacity-40">전송</button>
          </div>
        </form>
      </div>
      {confirmClose && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#17314d]/45 p-5"
        onClick={e => { e.stopPropagation(); setConfirmClose(false); }}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="chat-exit-title" aria-describedby="chat-exit-description"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Escape') { e.stopPropagation(); setConfirmClose(false); }
            if (e.key === 'Tab') {
              const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('button');
              const first = buttons[0], last = buttons[buttons.length - 1];
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }} className="w-full max-w-[280px] rounded-3xl bg-white p-4 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf4fb] text-[#0570db]" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </div>
            <h3 id="chat-exit-title" className="text-[15px] font-bold text-[#17314d]">대화를 종료할까요?</h3>
          </div>
          <p id="chat-exit-description" className="mt-2 text-xs leading-relaxed text-[#61758c]">나가면 대화 기록이 지워집니다.<br/>그래도 나가시겠습니까?</p>
          <div className="mt-4 flex gap-2">
            <button ref={continueButton} type="button" onClick={() => setConfirmClose(false)} className="flex-1 rounded-2xl bg-[#edf4fb] px-2 py-2.5 text-xs font-bold text-[#0570db]">계속 대화하기</button>
            <button type="button" onClick={leave} className="flex-1 rounded-2xl bg-[#0570db] px-2 py-2.5 text-xs font-bold text-white">나가기</button>
          </div>
        </div>
      </div>}
    </div>}
  </>;
}
