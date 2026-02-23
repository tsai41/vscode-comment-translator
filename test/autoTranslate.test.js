const test = require('node:test');
const assert = require('node:assert/strict');

const { makeTranslationCacheKey, makeCodeLensTitle, makeHoverText } = require('../src/autoTranslateUtils');

test('makeTranslationCacheKey normalizes api url trailing slash', () => {
  const a = makeTranslationCacheKey('http://127.0.0.1:8989/', 'auto', 'zh-Hant', 'hello');
  const b = makeTranslationCacheKey('http://127.0.0.1:8989', 'auto', 'zh-Hant', 'hello');
  assert.equal(a, b);
});

test('makeCodeLensTitle renders translation with icon', () => {
  assert.equal(makeCodeLensTitle('你好'), '$(globe) 你好');
});

test('makeCodeLensTitle truncates very long translation', () => {
  const text = 'a'.repeat(200);
  const title = makeCodeLensTitle(text);
  assert.equal(title.endsWith('...'), true);
  assert.equal(title.startsWith('$(globe) '), true);
});

test('makeHoverText does not include codicon token', () => {
  assert.equal(makeHoverText('你好'), '你好');
});
