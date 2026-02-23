const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeOctopusEndpoint } = require('../src/providers/octopusProvider');

test('normalizeOctopusEndpoint appends chat completions path', () => {
  assert.equal(
    normalizeOctopusEndpoint('http://localhost:13000'),
    'http://localhost:13000/v1/chat/completions'
  );
});

test('normalizeOctopusEndpoint handles /v1 input', () => {
  assert.equal(
    normalizeOctopusEndpoint('http://localhost:13000/v1'),
    'http://localhost:13000/v1/chat/completions'
  );
});

test('normalizeOctopusEndpoint keeps full endpoint unchanged', () => {
  assert.equal(
    normalizeOctopusEndpoint('http://localhost:13000/v1/chat/completions'),
    'http://localhost:13000/v1/chat/completions'
  );
});
