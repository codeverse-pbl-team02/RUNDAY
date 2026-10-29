import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(await readFile(new URL('../src/platform/location.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const flush = () => new Promise(resolve => setImmediate(resolve));

async function load(plugin, native = true, navigator = {}) {
  const context = vm.createContext({ navigator });
  const module = new vm.SourceTextModule(source, { context });
  await module.link(specifier => new vm.SyntheticModule(
    specifier === './native' ? ['isNative'] : ['Geolocation'],
    function () { this.setExport(specifier === './native' ? 'isNative' : 'Geolocation', specifier === './native' ? native : plugin); },
    { context },
  ));
  await module.evaluate();
  return module.namespace;
}

test('pausing while Android is creating a watch clears the eventual watch and ignores late positions', async () => {
  let completeWatch, callback;
  const cleared = [], positions = [];
  const location = await load({
    checkPermissions: async () => ({ location: 'granted' }),
    watchPosition: (_options, next) => { callback = next; return new Promise(resolve => { completeWatch = resolve; }); },
    clearWatch: async ({ id }) => { cleared.push(id); },
  });
  const stop = location.watchLocation(value => positions.push(value), () => assert.fail('Unexpected GPS error'), {});
  await flush();
  stop();
  callback({ timestamp: 1, coords: { latitude: 35, longitude: 129, accuracy: 5 } });
  completeWatch('native-watch-1');
  await flush();
  assert.deepEqual(cleared, ['native-watch-1']);
  assert.equal(positions.length, 0);
});

test('denying precise location reports permission denial without starting a GPS watch', async () => {
  const errors = [];
  let watches = 0;
  const location = await load({
    checkPermissions: async () => ({ location: 'prompt' }),
    requestPermissions: async () => ({ location: 'denied', coarseLocation: 'granted' }),
    watchPosition: async () => { watches++; return 'unexpected'; },
  });
  location.watchLocation(() => assert.fail('Unexpected position'), error => errors.push(error), {});
  await flush();
  assert.equal(watches, 0);
  assert.equal(errors[0].code, 1);
});

test('leaving before the Android permission dialog resolves never starts tracking', async () => {
  let permissionComplete, watches = 0;
  const location = await load({
    checkPermissions: async () => ({ location: 'prompt' }),
    requestPermissions: () => new Promise(resolve => { permissionComplete = resolve; }),
    watchPosition: async () => { watches++; return 'unexpected'; },
  });
  const stop = location.watchLocation(() => {}, () => {}, {});
  await flush();
  stop();
  permissionComplete({ location: 'granted' });
  await flush();
  assert.equal(watches, 0);
});

test('the browser path retains the original geolocation options and stops its own watch', async () => {
  const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
  let passedOptions, cleared;
  const location = await load({}, false, { geolocation: {
    watchPosition: (_success, _failure, value) => { passedOptions = value; return 42; },
    clearWatch: value => { cleared = value; },
  } });
  const stop = location.watchLocation(() => {}, () => {}, options);
  stop();
  assert.equal(passedOptions, options);
  assert.equal(cleared, 42);
});
