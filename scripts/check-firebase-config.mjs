import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
const missing = required.filter(key => !env[key] || env[key].startsWith('YOUR_'));
if (missing.length || env.VITE_FIREBASE_PROJECT_ID?.startsWith('demo-') || env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  console.error('배포용 Firebase 설정을 확인하세요. .env.local에 실제 프로젝트 값을 넣고 에뮬레이터 설정을 끄세요.');
  if (missing.length) console.error(`누락 항목: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`Firebase configuration ready for project: ${env.VITE_FIREBASE_PROJECT_ID}`);
