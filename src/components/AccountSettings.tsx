import { useState } from 'react';
import { accountDeletionAvailable } from '../lib/firebase';
import { useAuth } from '../auth/AuthProvider';
import { authError } from '../auth/errors';

export const accountInput = 'w-full h-[44px] bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] px-4 text-[14px] outline-none focus:border-[#0570db]';

export function ProfileEditor() {
  const { profile, saveProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!editing) return (
    <button type="button" className="w-full flex justify-between gap-3 px-4 py-[14px] text-left" onClick={() => {
      setName(profile?.displayName || ''); setBio(profile?.bio || ''); setMessage(''); setEditing(true);
    }}>
      <span className="font-bold text-[14px] text-[#0d1b2e]">✏️ 닉네임 · 한 줄 소개 수정</span>
      <span className="text-[#94afc8]">›</span>
    </button>
  );
  return <form className="p-4 flex flex-col gap-3" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await saveProfile(name, bio); setEditing(false); }
    catch (error) { setMessage(authError(error)); }
    finally { setBusy(false); }
  }}>
    <label className="text-[12px] text-[#555]">닉네임<input className={accountInput} value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} /></label>
    <label className="text-[12px] text-[#555]">한 줄 소개<input className={accountInput} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={100} /></label>
    {message && <p role="alert" className="text-[12px] text-red-600">{message}</p>}
    <div className="flex gap-2">
      <button disabled={busy} className="flex-1 rounded-xl bg-[#0570db] text-white py-2 text-[13px] disabled:opacity-50">{busy ? '저장 중…' : '저장'}</button>
      <button type="button" disabled={busy} onClick={() => setEditing(false)} className="px-4 text-[13px] text-[#94afc8]">취소</button>
    </div>
  </form>;
}

export function DeleteAccountForm() {
  const { user, deleteAccount, deleting, deletionPending } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const usesPassword = user?.providerData.some((provider) => provider.providerId === 'password');
  return <form className="flex flex-col gap-3 p-4 bg-red-50" onSubmit={async (event) => {
    event.preventDefault(); if (!confirmed || deleting) return;
    setMessage('');
    try { await deleteAccount(password); }
    catch (error) { setMessage(authError(error)); }
    finally { setPassword(''); }
  }}>
    <p className="text-[12px] text-[#555]">탈퇴하면 계정과 저장된 회원 정보가 삭제되며 복구할 수 없습니다.</p>
    {usesPassword ? <label className="text-[12px] text-[#555]">현재 비밀번호
      <input className={accountInput} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={deleting} />
    </label> : <p className="text-[12px] text-[#555]">Google 계정으로 다시 본인 인증합니다.</p>}
    <label className="flex items-start gap-2 text-[12px] text-[#555]">
      <input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} disabled={deleting} />
      계정과 회원 정보 삭제에 동의합니다.
    </label>
    {message && <p role="alert" className="text-[12px] text-red-600">{message}</p>}
    <button disabled={!confirmed || deleting || !accountDeletionAvailable} className="rounded-xl bg-[#ef4444] text-white py-3 text-[13px] font-bold disabled:opacity-50">
      {!accountDeletionAvailable ? '탈퇴 서비스 준비 중' : deleting ? '탈퇴 처리 중…' : deletionPending ? '탈퇴 처리 다시 시도' : '본인 인증 후 탈퇴'}
    </button>
  </form>;
}

export default function AccountSettings() {
  const { user, logout, resetPassword, deleting } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function run(action: () => Promise<void>, success = '') {
    setBusy(true); setMessage('');
    try { await action(); setMessage(success); }
    catch (error) { setMessage(authError(error)); }
    finally { setBusy(false); }
  }
  const row = 'w-full flex gap-3 items-center px-4 py-[14px] text-left text-[14px] font-bold border-b border-[#d6e9f8] disabled:opacity-50';
  return <>
    {user?.providerData.some((provider) => provider.providerId === 'password') &&
      <button className={`${row} text-[#0d1b2e]`} disabled={busy || deleting} onClick={() => void run(() => resetPassword(user.email!), '비밀번호 재설정 안내를 이메일로 보냈습니다.')}>🔒 비밀번호 재설정</button>}
    <button className={`${row} text-[#ef4444]`} disabled={busy || deleting} onClick={() => void run(logout)}>🚪 로그아웃</button>
    <button className={`${row} text-[#ef4444]`} disabled={busy || deleting || !accountDeletionAvailable} onClick={() => setShowDelete(!showDelete)} aria-expanded={showDelete}>🗑️ {!accountDeletionAvailable ? '계정 탈퇴 (서비스 준비 중)' : showDelete ? '탈퇴 취소' : '계정 탈퇴'}</button>
    {message && <p role="status" className="px-4 py-2 text-[12px] text-[#555]">{message}</p>}
    {showDelete && <DeleteAccountForm />}
  </>;
}
