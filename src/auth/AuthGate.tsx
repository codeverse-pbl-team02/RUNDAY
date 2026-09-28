import { useState, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { authError } from './errors';
import LoginScreen from '../screens/LoginScreen';
import { DeleteAccountForm } from '../components/AccountSettings';

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const button = 'w-full rounded-[14px] bg-[#0570db] py-3 text-[14px] text-white font-bold disabled:opacity-50';
  async function run(action: () => Promise<void>, success = '') {
    setMessage(''); setBusy(true);
    try { await action(); setMessage(success); }
    catch (error) { setMessage(authError(error)); }
    finally { setBusy(false); }
  }
  if (auth.loading) return <div className="p-8 text-center text-[#0570db]" role="status">로그인 확인 중…</div>;
  if (!auth.user) return <LoginScreen />;
  if (auth.deletionPending || auth.deleting || auth.deletionError) return <div className="h-full overflow-y-auto bg-[#edf4fb] p-5">
    <h1 className="text-[20px] font-bold mb-3">회원 탈퇴 처리</h1>
    <p className="text-[13px] text-[#555] mb-4">{auth.deletionPending ? '탈퇴가 시작된 계정입니다. 처리가 중단됐다면 다시 시도해 주세요.' : '본인 인증 후 계정과 회원 정보를 삭제합니다.'}</p>
    {auth.deletionError && <p role="alert" className="text-[12px] text-red-600 mb-3">{auth.deletionError}</p>}
    <DeleteAccountForm />
    {!auth.deletionPending && !auth.deleting && <button className="w-full py-3 text-[13px] text-[#555]" onClick={auth.dismissDeletionError}>돌아가기</button>}
    <button disabled={auth.deleting || busy} className={`${button} mt-4`} onClick={() => void run(auth.logout)}>로그아웃</button>
    {message && <p role="status" className="text-[12px] mt-3">{message}</p>}
  </div>;
  if (auth.profileError || !auth.profile) return <div className="p-6 flex flex-col gap-4 bg-[#f0f7ff] h-full">
    <p role="status" className="text-[14px]">{auth.profileError || '회원 정보를 불러오는 중…'}</p>
    {auth.profileError && <button className={button} onClick={auth.retryProfile}>다시 시도</button>}
    <button disabled={busy} className={button} onClick={() => void run(auth.logout)}>로그아웃</button>
    {message && <p role="status" className="text-[12px]">{message}</p>}
  </div>;
  return <>{children}</>;
}
