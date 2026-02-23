const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeDisplayMode } = require('../src/config');

test('normalizeDisplayMode defaults to codelens', () => {
  assert.equal(normalizeDisplayMode(undefined), 'codelens');
  assert.equal(normalizeDisplayMode(''), 'codelens');
});

test('normalizeDisplayMode accepts hover', () => {
  assert.equal(normalizeDisplayMode('hover'), 'hover');
  assert.equal(normalizeDisplayMode(' HOVER '), 'hover');
});

test('normalizeDisplayMode falls back for unknown value', () => {
  assert.equal(normalizeDisplayMode('inline'), 'codelens');
});
