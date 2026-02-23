const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCommentLine, buildTranslatedCommentLine } = require('../src/commentParser');

test('parse // comment line', () => {
  const parsed = parseCommentLine('  // hello world');
  assert.deepEqual(parsed, {
    indent: '  ',
    markerStart: '//',
    markerEnd: '',
    spacerAfterStart: ' ',
    content: 'hello world',
  });
});

test('parse hash comment line', () => {
  const parsed = parseCommentLine('# TODO: refactor');
  assert.equal(parsed.content, 'TODO: refactor');
  assert.equal(parsed.markerStart, '#');
});

test('parse single-line block comment', () => {
  const parsed = parseCommentLine('  /* hello */');
  assert.deepEqual(parsed, {
    indent: '  ',
    markerStart: '/*',
    markerEnd: '*/',
    spacerAfterStart: ' ',
    content: 'hello',
  });
});

test('build translated // comment line', () => {
  const parsed = parseCommentLine('  // hello');
  const line = buildTranslatedCommentLine(parsed, '你好');
  assert.equal(line, '  // 你好');
});

test('return null for non-comment text', () => {
  assert.equal(parseCommentLine('const a = 1;'), null);
});
