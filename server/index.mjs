import { createServer } from 'node:http';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRoutingHandler } from './handler.mjs';
import { createKakaoRouter } from './kakao.mjs';
import { readFile } from 'node:fs/promises';
import { createChat } from './chat.mjs';

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
if (!projectId) throw new Error('Set FIREBASE_PROJECT_ID in server/.env');
initializeApp({ projectId });
const firebaseAuth = getAuth();
const shared = {
  verifyToken: async token => {
    try { return await firebaseAuth.verifyIdToken(token); }
    catch (error) {
      console.warn(`Firebase ID token rejected (${error?.code || error?.name || 'unknown'}).`);
      throw error;
    }
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean) };
const handler = createRoutingHandler({ ...shared, route: createKakaoRouter({ key: process.env.KAKAO_REST_API_KEY }) });
const documents = JSON.parse(await readFile(new URL('./knowledge.json', import.meta.url), 'utf8'));
const chatHandler = createRoutingHandler({ ...shared, path: '/api/chat', bodyLimit: 20_000, maxActive: 4, route: createChat({
  key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small', documents,
}) });
const server = createServer((request, response) => { void (request.url === '/api/chat' ? chatHandler : handler)(request, response); });
server.requestTimeout = 75_000;
server.headersTimeout = 10_000;
server.listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1', () => {
  console.log(`Runday routing server listening on ${server.address().port}.`);
});
