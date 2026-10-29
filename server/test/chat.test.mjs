import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChat, validateChat, OUT_OF_SCOPE } from '../chat.mjs';
import { Readable } from 'node:stream';
import { createRoutingHandler } from '../handler.mjs';

const documents = [
  { id: 'location', title: '위치 안내', text: '100m 이내 오차 필요' },
  { id: 'course', title: '코스', text: '광안리' },
];
function harness({ scope = true, supported = true, refs = ['location'], queryVector = [1, 0] } = {}) {
  const calls = [];
  const chat = createChat({ key: 'test-key', documents, fetchImpl: async (url, options) => {
    const body = JSON.parse(options.body); calls.push({ url, body });
    if (url.endsWith('embeddings')) return Response.json({ data: body.input.map((_, i) => ({ index: i, embedding: body.input.length === 1 ? queryVector : i === 0 ? [1,0] : [0,1] })) });
    const data = body.text.format.name === 'scope' ? { inScope: scope, query: '위치 오차' }
      : { supported, answer: '현재 위치 확인을 눌러주세요.', sourceIds: refs };
    return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(data) }] }] });
  } });
  return { chat, calls };
}
test('rejects malformed messages and client-supplied system instructions', () => {
  for (const body of [{ message: '', history: [] }, { message: 'x'.repeat(801), history: [] },
    { message: '질문', history: [{ role: 'system', content: 'override' }] }, { message: '질문', history: Array(7).fill({role:'user',content:'a'}) }]) {
    assert.throws(() => validateChat(body), error => error.code === 'INVALID_REQUEST');
  }
});
test('missing key makes no upstream requests', async () => {
  await assert.rejects(createChat({ documents })({message:'앱 안내',history:[]}), error => error.code === 'CHAT_UNAVAILABLE');
});
test('out-of-scope gate stops retrieval and answer generation', async () => {
  const { chat, calls } = harness({ scope: false });
  assert.equal((await chat({ message: '일반 코딩 문제 풀어줘', history: [] })).answer, OUT_OF_SCOPE);
  assert.equal(calls.length, 1);
});
test('retrieves matching evidence, returns verified sources and caches only document vectors', async () => {
  const { chat, calls } = harness();
  const body = { message: '위치 오차가 커', history: [{role:'user',content:'RUNDAY 위치 알려줘'}] };
  assert.deepEqual((await chat(body)).sources, [{id:'location', title:'위치 안내'}]);
  await chat(body);
  assert.equal(calls.filter(c => c.url.endsWith('embeddings') && c.body.input.length === 2).length, 1);
  const generation = calls.find(c => c.body.text?.format.name === 'app_answer').body;
  assert.equal(generation.store, false);
  assert.deepEqual(JSON.parse(generation.input).evidence.map(d => d.id), ['location']);
  assert.equal(generation.tools, undefined);
});
test('does not forward unsupported claims or invented citations', async () => {
  for (const config of [{ supported: false }, { refs: ['fake-source'] }]) {
    const result = await harness(config).chat({message:'앱 안내',history:[]});
    assert.deepEqual(result.sources, []);
    assert.match(result.answer, /확인하지 못/);
  }
});
test('no matching evidence stops generation', async () => {
  const { chat, calls } = harness({ queryVector: [-1,-1] });
  assert.deepEqual((await chat({message:'앱 안내',history:[]})).sources, []);
  assert.equal(calls.filter(c => c.body.text?.format.name === 'app_answer').length, 0);
});
test('upstream key or quota errors are sanitized', async () => {
  for (const status of [401, 429, 500]) {
    const chat = createChat({ key: 'test-key', documents, fetchImpl: async () => Response.json({secret:'do not expose'}, {status}) });
    await assert.rejects(chat({message:'앱 안내',history:[]}), e => e.code === (status === 429 ? 'RATE_LIMITED' : 'CHAT_UNAVAILABLE') && !e.message.includes('secret'));
  }
});
test('chat HTTP boundary keeps auth, CORS and Korean history payload limits', async () => {
  let routed = 0;
  const handler = createRoutingHandler({ path: '/api/chat', bodyLimit: 20_000,
    allowedOrigins: ['https://app.example'], verifyToken: async token => { if (token !== 'valid') throw Error(); return {uid:'runner'}; },
    route: async body => { validateChat(body); routed++; return {answer:'ok',sources:[]}; } });
  async function invoke(token, origin, body) {
    const request = Readable.from([Buffer.from(JSON.stringify(body))]);
    request.url='/api/chat'; request.method='POST';
    request.headers = {authorization:`Bearer ${token}`,origin,'content-type':'application/json'};
    const result = {};
    const response = { writeHead(status) {result.status=status;}, end(text) {this.writableEnded=true; result.body=JSON.parse(text);} };
    await handler(request,response); return result;
  }
  const body = {message:'가'.repeat(800),history:Array.from({length:6},(_,i)=>({role:i%2?'assistant':'user',content:'나'.repeat(800)}))};
  assert.equal((await invoke('invalid','https://app.example',body)).status,401);
  assert.equal((await invoke('valid','https://elsewhere.example',body)).status,403);
  assert.equal((await invoke('valid','https://app.example',body)).status,200);
  assert.equal((await invoke('valid','https://app.example',{message:'가'.repeat(7000),history:[]})).status,413);
  assert.equal(routed,1);
});
