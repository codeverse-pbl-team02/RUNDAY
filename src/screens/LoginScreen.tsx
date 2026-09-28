import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { authError } from '../auth/errors';
import { firebaseConfigured } from '../lib/firebase';

const logo = '/assets/9065b.png';
const eyeIcon = '/assets/18cb3.svg';
const inputClass = 'w-full h-[44px] bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] px-4 text-[14px] outline-none focus:border-[#0570db] transition-colors text-[#222]';

export default function LoginScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  function changeMode(next: typeof mode) {
    setMode(next); setMessage(''); setPassword(''); setConfirmation(''); setShowPassword(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage(''); setFailed(false);
    try {
      if (mode === 'register') {
        if (password !== confirmation) throw new Error('비밀번호가 일치하지 않습니다.');
        await auth.register(email, password, name, rememberMe);
      } else if (mode === 'reset') {
        await auth.resetPassword(email);
        setMessage('등록된 이메일이라면 비밀번호 재설정 안내가 발송됩니다. 스팸함도 확인해 주세요.');
      } else {
        await auth.login(email, password, rememberMe);
      }
    } catch (error) { setFailed(true); setMessage(authError(error)); }
    finally { setBusy(false); }
  }
  async function googleLogin() {
    if (busy) return;
    setBusy(true); setMessage(''); setFailed(false);
    try { await auth.googleLogin(rememberMe); }
    catch (error) { setFailed(true); setMessage(authError(error)); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#f0f7ff]">
      {/* Blue gradient header */}
      <div
        className="relative flex-shrink-0 flex flex-col items-center justify-center"
        style={{
          height: 160,
          background: 'linear-gradient(160deg, #005fcc 0%, #0099ff 45%, #55c8ff 80%, #c8eeff 100%)',
        }}
      >
        {/* Soft glow behind logo */}
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <img src={logo} alt="뛴데이" className="relative h-[72px] w-[180px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]" />
        <p
          className="mt-2 text-[12px] text-center tracking-wide relative"
          style={{ fontFamily: 'Noto Sans KR', fontWeight: 500, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,60,140,0.3)' }}
        >
          달리는 일상, 더 즐겁게
        </p>
      </div>

      <div className="relative shrink-0 px-4 mt-3">
        <div className="bg-white rounded-3xl shadow-[0px_8px_40px_0px_rgba(26,143,255,0.12)] overflow-hidden">
          <div className="flex border-b border-[#f0f0f0]">
            {(['login', 'register'] as const).map((tab) => (
              <button key={tab} type="button" disabled={busy} aria-pressed={mode === tab}
                onClick={() => changeMode(tab)}
                className={`flex-1 py-2.5 text-[14px] text-center border-b-2 ${mode === tab ? 'text-[#0570db] border-[#0570db] font-bold' : 'text-[#aaa] border-transparent font-medium'}`}>
                {tab === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="px-5 pt-4 pb-3 flex flex-col gap-2.5">
            {!firebaseConfigured && <p role="status" className="text-[12px] text-[#7b8796]">로그인 서비스를 준비 중입니다. 연결이 완료되면 이용할 수 있습니다.</p>}
            {mode === 'reset' && <h1 className="text-[15px] font-bold text-[#0570db]">비밀번호 찾기</h1>}
            {mode === 'register' && <label className="block text-[12px] text-[#555] font-semibold">닉네임
              <input className={`${inputClass} mt-1`} autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} disabled={busy} placeholder="사용할 닉네임" />
            </label>}
            <label className="block text-[12px] text-[#555] font-semibold">이메일
              <input className={`${inputClass} mt-1`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={busy} placeholder="example@email.com" />
            </label>
            {mode !== 'reset' && <>
              <div>
                <label htmlFor="auth-password" className="block text-[12px] text-[#555] mb-1 font-semibold">비밀번호</label>
                <div className="relative">
                  <input id="auth-password" className={`${inputClass} pr-12`} type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'register' ? 8 : undefined}
                    disabled={busy} placeholder={mode === 'register' ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'} />
                  <button type="button" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <img src={eyeIcon} alt="" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {mode === 'register' && <label className="block text-[12px] text-[#555] font-semibold">비밀번호 확인
                <input className={`${inputClass} mt-1`} type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required disabled={busy} />
              </label>}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#666]">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={busy} className="w-4 h-4 accent-[#0570db]" />로그인 상태 유지
                </label>
                {mode === 'login' && <button type="button" disabled={busy} onClick={() => changeMode('reset')} className="text-[12px] text-[#888] font-medium">비밀번호 찾기</button>}
              </div>
            </>}
            {message && <p role={failed ? 'alert' : 'status'} className={`text-[12px] ${failed ? 'text-red-600' : 'text-[#0570db]'}`}>{message}</p>}
            <button type="submit" disabled={busy || !firebaseConfigured}
              className="w-full h-[46px] rounded-[14px] text-white text-[15px] font-bold shadow-[0px_4px_8px_rgba(26,143,255,0.35)] transition-opacity active:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(170.5deg, #1a8fff 0%, #0070e0 100%)' }}>
              {busy ? '처리 중…' : mode === 'register' ? '회원가입' : mode === 'reset' ? '재설정 메일 보내기' : '로그인'}
            </button>
            {mode === 'reset' && <button type="button" onClick={() => changeMode('login')} disabled={busy} className="text-[12px] text-[#0570db] py-2">로그인으로 돌아가기</button>}
          </form>
          {mode !== 'reset' && <>
            <div className="px-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#eee]" />
              <span className="text-[11px] text-[#aaa] whitespace-nowrap font-medium">또는 소셜 계정으로 로그인</span>
              <div className="flex-1 h-px bg-[#eee]" />
            </div>
            <div className="px-5 pt-3 pb-4 flex flex-col gap-2">
              <button type="button" disabled title="카카오 로그인 준비 중" className="w-full h-[44px] rounded-[14px] bg-[#fee500] flex items-center justify-center gap-2 cursor-not-allowed">
                <img src="/assets/e97a3.svg" alt="" className="w-[18px] h-[18px]" />
                <span className="text-[14px] text-[#3c1e1e] font-bold">카카오로 로그인 <small className="text-[10px]">(준비 중)</small></span>
              </button>
              <button type="button" disabled={busy || !firebaseConfigured} onClick={() => void googleLogin()} className="w-full h-[44px] rounded-[14px] bg-white border border-[#e5e5e5] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50">
                <img src="/assets/7f5b7.svg" alt="" className="w-[18px] h-[18px]" />
                <span className="text-[14px] text-[#333] font-semibold">Google로 로그인</span>
              </button>
              <button type="button" disabled title="Apple 로그인 준비 중" className="w-full h-[44px] rounded-[14px] bg-[#111] flex items-center justify-center gap-2 cursor-not-allowed">
                <img src="/assets/79a05.svg" alt="" className="w-[17px] h-[17px]" />
                <span className="text-[14px] text-white font-semibold">Apple로 로그인 <small className="text-[10px]">(준비 중)</small></span>
              </button>
              {mode === 'login' && <div className="pt-1 text-center">
                <span className="text-[12px] text-[#888]">아직 계정이 없으신가요? </span>
                <button type="button" disabled={busy} onClick={() => changeMode('register')} className="text-[12px] text-[#0570db] font-bold">회원가입</button>
              </div>}
            </div>
          </>}
        </div>
      </div>
      <div className="mt-auto shrink-0 py-4 text-center">
        <p className="text-[12px] text-[#aaa]">지구와 함께 달리는 러닝앱, 뛴데이 🌍</p>
      </div>
    </div>
  );
}
