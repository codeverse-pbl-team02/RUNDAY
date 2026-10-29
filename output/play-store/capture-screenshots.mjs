import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Isolated browser fixtures: no accounts are created and no backend writes occur.
const out = path.resolve('output/play-store/screenshots');
await mkdir(out, { recursive: true });
const browserProfile = await mkdtemp(path.join(os.tmpdir(), 'rundy-store-capture-'));
const edge = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=9333', '--remote-debugging-address=127.0.0.1',
  '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions',
  `--user-data-dir=${browserProfile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
edge.on('error', error => console.error(error.message));
let ws;
try {
  let info;
  for (let i = 0; i < 60; i++) {
    try { info = await (await fetch('http://127.0.0.1:9333/json/version', {signal:AbortSignal.timeout(1000)})).json(); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  if (!info) throw new Error('Headless browser did not start');
  ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const listeners = new Map();
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 35000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer); pending.delete(message.id);
      message.error ? item.reject(new Error(JSON.stringify(message.error))) : item.resolve(message.result);
    } else {
      for (const listener of listeners.get(message.method) || []) listener(message);
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  console.log('Browser connected');
  const command = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };
  const authFixture = `
    const profile = {displayName:'러너',email:'runner@example.com',bio:'',dataVersion:2,pointsBalance:0};
    const state = {user:{uid:'local-store-preview',displayName:'러너'},profile,loading:false,
      profileError:'',deletionPending:false,deleting:false,deletionError:'',
      logout:async()=>{},dismissDeletionError:()=>{},retryProfile:()=>{}};
    export function AuthProvider({children}) {return children;}
    export function useAuth(){return state;}
  `;
  const activityFixture = `
    const state={runs:[],loading:false,error:'',totalDistanceMeters:0,activeDays:0,longestStreak:0,badgeCount:0};
    export function ActivityProvider({children}){return children;}
    export function useActivity(){return state;}
  `;
  listeners.set('Fetch.requestPaused', [async message => {
    try {
      const pathname = new URL(message.params.request.url).pathname;
      const source = pathname.endsWith('/auth/AuthProvider.tsx') ? authFixture : activityFixture;
      await send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200,
        responseHeaders: [{name:'Content-Type',value:'text/javascript; charset=utf-8'}],
        body: Buffer.from(source).toString('base64') }, message.sessionId);
    } catch (error) { console.error('Fixture:', error.message); }
  }]);
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Fetch.enable', { patterns: [
    {urlPattern:'*/src/auth/AuthProvider.tsx*',requestStage:'Request'},
    {urlPattern:'*/src/running/ActivityProvider.tsx*',requestStage:'Request'},
  ] });
  await command('Emulation.setDeviceMetricsOverride', {width:360,height:640,deviceScaleFactor:3,mobile:true,screenWidth:360,screenHeight:640});
  await command('Emulation.setTouchEmulationEnabled', {enabled:true});
  await send('Browser.grantPermissions', {origin:'http://localhost:5174',permissions:['geolocation']});
  await command('Emulation.setGeolocationOverride', {latitude:35.1538,longitude:129.1187,accuracy:8});
  await command('Page.navigate', { url:'http://localhost:5174/' });
  for (let i = 0; i < 100; i++) {
    if ((await evaluate('document.body?.innerText || ""')).includes('러너')) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  await evaluate(`(() => {const style=document.createElement('style');style.textContent='#root,#root>div,#root>div>div{height:640px!important}*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important}';document.head.append(style)})()`);
  await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,15000))]).then(()=>true)');
  const settle = () => new Promise(resolve => setTimeout(resolve, 1100));
  async function capture(name) {
    await settle();
    const shot = await command('Page.captureScreenshot', { format:'png', captureBeyondViewport:false, fromSurface:true });
    await writeFile(path.join(out,name),Buffer.from(shot.data,'base64'));
    console.log(`Saved ${name}`);
  }
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.innerText.trim()==='위치 확인')?.click()`);
  await new Promise(resolve => setTimeout(resolve, 8000));
  console.log('Home map:',await evaluate(`Array.from(document.querySelectorAll('[role="status"]')).map(e=>e.innerText)`));
  await evaluate(`(() => {const target=Array.from(document.querySelectorAll('p')).find(e=>e.textContent.trim()==='오늘의 추천 코스');const scroller=Array.from(document.querySelectorAll('.overflow-y-auto')).find(e=>e.contains(target));if(target&&scroller)scroller.scrollTop+=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-12})()`);
  await capture('01-home.png');
  console.log('Buttons:',await evaluate('Array.from(document.querySelectorAll("button")).map(b=>({text:b.innerText,label:b.getAttribute("aria-label")}))'));
  const clickText = async text => {
    const did = await evaluate(`(() => {const b=Array.from(document.querySelectorAll('button')).find(b=>b.innerText.trim()===${JSON.stringify(text)});if(!b)return false;b.click();return true})()`);
    if (!did) throw new Error(`Button not found: ${text}`);
    await settle();
  };
  await clickText('코스');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await evaluate(`(() => {const target=Array.from(document.querySelectorAll('button')).find(e=>e.innerText.trim()==='전체');const scroller=Array.from(document.querySelectorAll('.overflow-y-auto')).find(e=>e.contains(target));if(target&&scroller)scroller.scrollTop+=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-12})()`);
  await capture('02-courses.png');
  console.log('Course buttons:',await evaluate('Array.from(document.querySelectorAll("button")).map(b=>b.innerText)'));
  const detailClick = await evaluate(`(() => {const b=Array.from(document.querySelectorAll('button')).find(b=>b.innerText.trim()==='코스 시작');if(!b)return false;b.click();return true})()`);
  if (detailClick) await capture('03-course-detail.png');
  else console.log('Detail selection needs follow-up');
  await clickText('홈');
  await evaluate(`document.querySelector('button:has(img[alt="menu"])').click()`);
  await clickText('러닝 & 기록');
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.innerText.includes('나의 배지')).click()`);
  await capture('04-badges.png');
  console.log('Final text:',await evaluate('document.body.innerText'));
  await writeFile(path.join(out,'capture-info.json'),JSON.stringify({width:1080,height:1920,profile:'local sample profile',backendWrites:false},null,2));
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({id:999999,method:'Browser.close'}));
    ws.close();
  }
  edge.kill();
}
