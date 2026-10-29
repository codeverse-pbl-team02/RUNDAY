import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual Android Back callback and exit dialog without a device.
function setup({ activeRun = false, saveSucceeds = true } = {}) {
  const slots = [];
  let cursor = 0;
  let back;
  let exits = 0;
  let subscriptions = 0;
  const run = {
    mode: activeRun ? 'running' : 'idle', saved: false, saving: false, message: '',
    session: { points: activeRun ? [{}] : [] },
    pause() { if (this.mode === 'running') this.mode = 'paused'; },
    finish() { this.mode = 'finished'; },
    async save() { this.saved = saveSucceeds; return saveSucceeds; },
    reset() { this.mode = 'idle'; this.session.points = []; },
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      previous?.cleanup?.();
      slots[index] = { deps, cleanup: effect() };
    },
  };
  function load(path, imports = {}) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
      + (path.endsWith('/App.tsx') ? '\nexport { MemberApp };' : '');
    const { outputText } = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
    } });
    const context = { exports: {}, require(name) {
      if (name in imports) return imports[name];
      return { default: name };
    } };
    vm.runInNewContext(outputText, context);
    return context.exports;
  }
  const actions = load('../src/navigation/backActions.ts');
  const hook = load('../src/navigation/useBackAction.ts', { react, './backActions': actions });
  const jsx = (type, props) => ({ type, props });
  const app = load('../src/App.tsx', {
    react,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@capacitor/app': { App: {
      async addListener(_name, callback) { back = callback; subscriptions++; return { remove() {} }; },
      async exitApp() { exits++; },
    } },
    './platform/native': { isNative: true },
    './navigation/backActions': actions,
    './navigation/useBackAction': hook,
    './running/RunProvider': { useRun: () => run },
  });
  return {
    run, actions,
    render() { cursor = 0; return app.MemberApp(); },
    back: () => back(),
    get exits() { return exits; },
    get subscriptions() { return subscriptions; },
  };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const found = find(child, predicate);
    if (found) return found;
  }
}

test('Back exits an idle home and keeps a single native subscription across renders', () => {
  const app = setup();
  app.render(); app.render(); app.back();
  assert.equal(app.exits, 1);
  assert.equal(app.subscriptions, 1);
});

test('transient UI consumes Back before the home exits', () => {
  const app = setup(); app.render();
  let closed = false;
  const remove = app.actions.registerBackAction(() => { closed = true; });
  app.back();
  assert.equal(closed, true);
  assert.equal(app.exits, 0);
  remove(); remove();
  app.back();
  assert.equal(app.exits, 1);
});

test('unsaved running pauses and opens an exit dialog; Back dismisses it', () => {
  const app = setup({ activeRun: true }); app.render(); app.back();
  assert.equal(app.run.mode, 'paused');
  assert.equal(app.exits, 0);
  assert.ok(find(app.render(), node => node.props?.role === 'dialog'));
  app.back();
  assert.equal(find(app.render(), node => node.props?.role === 'dialog'), undefined);
  assert.equal(app.exits, 0);
});

for (const saveSucceeds of [false, true]) {
  test(`save-and-exit ${saveSucceeds ? 'exits after successful storage' : 'stays open when storage fails'}`, async () => {
    const app = setup({ activeRun: true, saveSucceeds }); app.render(); app.back();
    const button = find(app.render(), node => node.type === 'button' && node.props.children === '기록 저장 후 종료');
    assert.ok(button);
    await button.props.onClick();
    assert.equal(app.exits, saveSucceeds ? 1 : 0);
    assert.equal(app.run.saved, saveSucceeds);
  });
}

test('discard-and-exit clears the running session only after choosing that action', async () => {
  const app = setup({ activeRun: true }); app.render(); app.back();
  assert.equal(app.run.session.points.length, 1);
  const button = find(app.render(), node => node.type === 'button' && node.props.children === '기록 버리고 종료');
  assert.ok(button);
  await button.props.onClick();
  assert.equal(app.run.session.points.length, 0);
  assert.equal(app.exits, 1);
});

test('Back actions close the most recently registered UI and tolerate cleanup out of order', () => {
  const { actions } = setup();
  const calls = [];
  const removeFirst = actions.registerBackAction(() => calls.push('first'));
  const removeSecond = actions.registerBackAction(() => calls.push('second'));
  assert.equal(actions.consumeBackAction(), true);
  assert.deepEqual(calls, ['second']);
  removeFirst(); removeSecond();
  assert.equal(actions.consumeBackAction(), false);
});
