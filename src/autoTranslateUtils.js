const { normalizeApiUrl } = require('./mtranClient');

const MAX_LENS_TITLE_LEN = 120;

function makeTranslationCacheKey(providerScope, from, to, text) {
  const scope = String(providerScope || '').trim();
  const normalizedScope = scope.startsWith('{') ? scope : normalizeApiUrl(scope);

  return JSON.stringify({
    scope: normalizedScope,
    from: from || 'auto',
    to: to || 'zh-Hant',
    text: text || '',
  });
}

function makeCodeLensTitle(translatedText) {
  const text = translatedText || '';
  const clipped = text.length > MAX_LENS_TITLE_LEN ? `${text.slice(0, MAX_LENS_TITLE_LEN)}...` : text;
  return `$(globe) ${clipped}`;
}

function makeHoverText(translatedText) {
  return translatedText || '';
}

module.exports = {
  makeTranslationCacheKey,
  makeCodeLensTitle,
  makeHoverText,
};
