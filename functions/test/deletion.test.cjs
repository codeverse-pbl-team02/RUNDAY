const test = require('node:test');
const assert = require('node:assert/strict');
const { performDeletion, hasRecentAuthentication } = require('../lib/deletion');

test('rejects missing, stale, and future authentication timestamps', () => {
  assert.equal(hasRecentAuthentication(undefined, 1000), false);
  assert.equal(hasRecentAuthentication(699, 1000), false);
  assert.equal(hasRecentAuthentication(1100, 1000), false);
  assert.equal(hasRecentAuthentication(900, 1000), true);
});

test('failed data cleanup preserves identity and deletion lock for retry', async () => {
  const actions = [];
  await assert.rejects(performDeletion({
    mark: async () => actions.push('lock'),
    removeDocuments: async () => actions.push('documents'),
    removeFiles: async () => { throw new Error('storage unavailable'); },
    removeIdentity: async () => actions.push('identity'),
    clearMarker: async () => actions.push('unlock'),
    onMarkerError: () => {},
  }));
  assert.deepEqual(actions, ['lock', 'documents']);
});

test('successful retry deletes identity only after documents and files', async () => {
  const actions = [];
  await performDeletion({
    mark: async () => actions.push('lock'),
    removeDocuments: async () => actions.push('documents'),
    removeFiles: async () => actions.push('files'),
    removeIdentity: async () => actions.push('identity'),
    clearMarker: async () => actions.push('unlock'),
    onMarkerError: () => {},
  });
  assert.deepEqual(actions, ['lock', 'documents', 'files', 'identity', 'unlock']);
});
