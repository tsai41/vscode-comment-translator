const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeProviderName, buildProviderCacheScope } = require('../src/translator');

test('normalizeProviderName defaults to mtran', () => {
  assert.equal(normalizeProviderName(undefined), 'mtran');
  assert.equal(normalizeProviderName(''), 'mtran');
});

test('normalizeProviderName accepts octopus', () => {
  assert.equal(normalizeProviderName('octopus'), 'octopus');
  assert.equal(normalizeProviderName(' OCTOPUS '), 'octopus');
});

test('buildProviderCacheScope includes selected provider fields', () => {
  const mtranScope = buildProviderCacheScope({ provider: 'mtran', apiUrl: 'http://127.0.0.1:8989/' });
  const octScope = buildProviderCacheScope({ provider: 'octopus', octopusEndpoint: 'http://localhost:13000' });
  assert.notEqual(mtranScope, octScope);
});
