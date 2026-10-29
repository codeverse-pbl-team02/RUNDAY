import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import { RoutingError } from '../routing.mjs';
import { createRoutingHandler } from '../handler.mjs';

const start = { label: '출발지', latitude: 35.15, longitude: 129.13 };
const end = { label: '도착지', latitude: 35.153, longitude: 129.134 };
const body = { start, end };

async function invoke(handler, { token = 'valid', origin = 'https://app.example', text = JSON.stringify(body), method = 'POST' } = {}) {
  const request = Readable.from([Buffer.from(text)]);
  request.url = '/api/walking-route'; request.method = method;
  request.headers = { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(origin ? { origin } : {}) };
  const result = { status: 0, headers: {}, body: null };
  const response = { destroyed: false, writableEnded: false,
    writeHead(status, headers) { result.status = status; result.headers = headers; },
    end(text) { this.writableEnded = true; result.body = text ? JSON.parse(text) : null; },
  };
  await handler(request, response);
  return result;
}

function handler(overrides = {}) {
  return createRoutingHandler({ allowedOrigins: ['https://app.example'],
    verifyToken: async token => { if (token !== 'valid') throw new Error('secret-error'); return { uid: 'member' }; },
    route: async () => ({ route: 'ok' }), ...overrides });
}

test('HTTP boundary requires Firebase authentication and an allowed browser origin', async () => {
  const api = handler();
  assert.equal((await invoke(api, { token: '' })).status, 401);
  assert.equal((await invoke(api, { token: 'invalid' })).status, 401);
  assert.equal((await invoke(api, { origin: 'https://untrusted.example' })).status, 403);
  const success = await invoke(api);
  assert.equal(success.status, 200);
  assert.equal(success.headers['Access-Control-Allow-Origin'], 'https://app.example');
  assert.equal(success.headers['Cache-Control'], 'no-store');
  const preflight = await invoke(api, { token: '', method: 'OPTIONS' });
  assert.equal(preflight.status, 204);
});

test('HTTP boundary rejects invalid JSON and oversized bodies and does not expose upstream secrets', async () => {
  const api = handler();
  assert.equal((await invoke(api, { text: '{' })).status, 400);
  assert.equal((await invoke(api, { text: 'x'.repeat(9000) })).status, 413);
  const failure = await invoke(handler({ route: async () => { throw new Error('private-api-key'); } }));
  assert.equal(failure.status, 500);
  assert.deepEqual(failure.body, { code: 'INTERNAL_ERROR' });
  const unavailable = await invoke(handler({ route: async () => { throw new RoutingError('SERVICE_UNAVAILABLE', 503); } }));
  assert.equal(unavailable.status, 503);
});

test('user request limit prevents unbounded paid route calls', async () => {
  let calls = 0;
  const api = handler({ route: async () => { calls++; return {}; } });
  for (let index = 0; index < 10; index++) assert.equal((await invoke(api)).status, 200);
  assert.equal((await invoke(api)).status, 429);
  assert.equal(calls, 10);
});

test('in-flight requests reserve their slot before reading bodies', async () => {
  const completions = [];
  const api = handler({ route: () => new Promise(resolve => completions.push(resolve)) });
  const first = invoke(api); const second = invoke(api);
  await new Promise(resolve => setImmediate(resolve));
  const third = await invoke(api);
  assert.equal(third.status, 429);
  completions.forEach(resolve => resolve({}));
  assert.equal((await first).status, 200);
  assert.equal((await second).status, 200);
});
