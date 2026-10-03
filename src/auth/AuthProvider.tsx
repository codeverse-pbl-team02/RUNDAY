import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword,
  deleteUser, EmailAuthProvider, GoogleAuthProvider, onIdTokenChanged, reauthenticateWithCredential,
  reauthenticateWithPopup, sendPasswordResetEmail,
  setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { accountDeletionAvailable, firebaseConfigured, getFirebase } from '../lib/firebase';
import { authError } from './errors';
import { deleteMemberData } from './deleteMemberData';

export interface MemberProfile { displayName: string; bio: string; email: string; dataVersion?: number; pointsBalance?: number }
interface AuthState {
  user: User | null;
  profile: MemberProfile | null;
  loading: boolean;
  profileError: string;
  deletionPending: boolean;
  deleting: boolean;
  deletionError: string;
  dismissDeletionError: () => void;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, remember: boolean) => Promise<void>;
  googleLogin: (remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveProfile: (name: string, bio: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  retryProfile: () => void;
}
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [profileError, setProfileError] = useState('');
  const [deletionPending, setDeletionPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState('');
  const [revision, setRevision] = useState(0);
  const deletionInProgress = useRef(false);
  const registrationInProgress = useRef(false);
  const deletionKey = (uid: string) => `runday.pendingDeletion.${uid}`;
  function pendingDeletion(uid: string) {
    try { return localStorage.getItem(deletionKey(uid)) === 'true'; }
    catch { return false; }
  }

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onIdTokenChanged(getFirebase().auth, (next) => {
      setUser(next);
      setRevision((value) => value + 1);
      if (!next) {
        setProfile(null);
        setProfileError('');
        setDeletionPending(false);
        setDeletionError('');
      }
      setLoading(false);
    }, () => { setProfileError('로그인 상태를 확인하지 못했습니다. 새로고침해 주세요.'); setLoading(false); });
  }, []);

  useEffect(() => {
    setProfile(null);
    setProfileError('');
    if (!user) return;
    const pending = pendingDeletion(user.uid);
    setDeletionPending(pending);
    if (pending || deletionInProgress.current || registrationInProgress.current) return;
    const { db } = getFirebase();
    let cancelled = false;
    let stopProfile: (() => void) | undefined;
    async function loadProfile() {
      try {
        if (cancelled || deletionInProgress.current || registrationInProgress.current) return;
        const ref = doc(db, 'rundayUsers', user!.uid);
        await runTransaction(db, async (transaction) => {
          const existing = await transaction.get(ref);
          if (cancelled || deletionInProgress.current || pendingDeletion(user!.uid)) return;
          if (existing.exists() && existing.data().deleting === true) { setDeletionPending(true); return; }
          if (!existing.exists()) {
            transaction.set(ref, {
              displayName: (user!.displayName || '러너').slice(0, 30), bio: '', email: user!.email || '',
              dataVersion: 2, pointsBalance: 0,
              createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            });
          } else if (existing.data().email !== user!.email) {
            transaction.update(ref, { email: user!.email || '', updatedAt: serverTimestamp() });
          }
        });
        if (cancelled) return;
        stopProfile = onSnapshot(ref, (snapshot) => {
          if (snapshot.exists()) {
            if (snapshot.data().deleting === true) setDeletionPending(true);
            setProfile(snapshot.data() as MemberProfile);
          }
        }, (error) => setProfileError(authError(error)));
      } catch (error) { if (!cancelled) setProfileError(authError(error)); }
    }
    void loadProfile();
    return () => { cancelled = true; stopProfile?.(); };
  }, [user, revision]);

  async function persistence(remember: boolean) {
    await setPersistence(getFirebase().auth, remember ? browserLocalPersistence : browserSessionPersistence);
  }
  async function resetPassword(email: string) {
    if (!email.trim()) throw new Error('이메일을 먼저 입력해 주세요.');
    try { await sendPasswordResetEmail(getFirebase().auth, email.trim()); }
    catch (error) {
      // Do not reveal whether a supplied address belongs to a member.
      if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
    }
  }

  const value: AuthState = {
    user, profile, loading, profileError, deletionPending, deleting, deletionError,
    dismissDeletionError: () => setDeletionError(''),
    async login(email, password, remember) {
      await persistence(remember);
      await signInWithEmailAndPassword(getFirebase().auth, email.trim(), password);
    },
    async register(email, password, name, remember) {
      if (!name.trim() || name.trim().length > 30) throw new Error('닉네임은 1~30자로 입력해 주세요.');
      if (password.length < 8) throw new Error('비밀번호는 8자 이상 입력해 주세요.');
      await persistence(remember);
      registrationInProgress.current = true;
      try {
        const result = await createUserWithEmailAndPassword(getFirebase().auth, email.trim(), password);
        await updateProfile(result.user, { displayName: name.trim() });
      } finally {
        registrationInProgress.current = false;
        setRevision((value) => value + 1);
      }
    },
    async googleLogin(remember) {
      await persistence(remember);
      await signInWithPopup(getFirebase().auth, new GoogleAuthProvider());
    },
    async logout() { await signOut(getFirebase().auth); },
    resetPassword,
    async saveProfile(name, bio) {
      if (!user) throw new Error('로그인이 필요합니다.');
      if (!name.trim() || name.trim().length > 30 || bio.length > 100) throw new Error('닉네임은 1~30자, 소개는 100자 이하로 입력해 주세요.');
      await updateDoc(doc(getFirebase().db, 'rundayUsers', user.uid), {
        displayName: name.trim(), bio: bio.trim(), updatedAt: serverTimestamp(),
      });
    },
    async deleteAccount(password) {
      if (!accountDeletionAvailable) throw new Error('회원 탈퇴 서비스를 준비 중입니다.');
      const { auth, db } = getFirebase();
      const current = auth.currentUser;
      if (!current) throw new Error('로그인이 필요합니다.');
      deletionInProgress.current = true;
      setDeleting(true);
      setDeletionError('');
      try {
        if (current.providerData.some((provider) => provider.providerId === 'password')) {
          if (!password) throw new Error('현재 비밀번호를 입력해 주세요.');
          await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email!, password));
        } else {
          await reauthenticateWithPopup(current, new GoogleAuthProvider());
        }
        await current.getIdToken(true);
        // Persist retry intent before any destructive operation; never store credentials.
        localStorage.setItem(deletionKey(current.uid), 'true');
        setDeletionPending(true);
        // Lock profile, delete private run pages, then profile; Auth deletion stays last.
        await deleteMemberData(db, current.uid);
        await deleteUser(current);
        try { localStorage.removeItem(deletionKey(current.uid)); } catch { /* Already deleted. */ }
        setUser(null);
        setProfile(null);
        setDeletionPending(false);
      } catch (error) {
        setDeletionError(authError(error));
        throw error;
      } finally { deletionInProgress.current = false; setDeleting(false); }
    },
    retryProfile: () => setRevision((value) => value + 1),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
