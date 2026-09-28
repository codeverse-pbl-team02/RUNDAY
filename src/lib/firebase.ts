import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = [config.apiKey, config.authDomain, config.projectId, config.appId].every(
  (value) => typeof value === 'string' && value.length > 0 && !value.startsWith('YOUR_'),
);

// An unconfigured checkout still renders the login UI without inventing a session.
function createServices() {
  if (!firebaseConfigured) return null;
  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp(config) : getApp();
  const auth = getAuth(app);
  auth.languageCode = 'ko';
  const db = getFirestore(app);
  if (isNew && env.DEV && env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return { auth, db };
}

const services = createServices();
export function getFirebase() {
  if (!services) throw new Error('현재 로그인 서비스를 준비 중입니다. 잠시 후 다시 이용해 주세요.');
  return services;
}

export const accountDeletionAvailable = firebaseConfigured;
