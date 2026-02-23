const DEFAULT_TIMEOUT_MS = 15000;

function normalizeApiUrl(url) {
  const v = (url || 'http://127.0.0.1:8989').trim();
  return v.endsWith('/') ? v.slice(0, -1) : v;
}

async function translateWithMtran(options) {
  const apiUrl = normalizeApiUrl(options.apiUrl);
  const apiToken = (options.apiToken || '').trim();
  const from = options.from || 'auto';
  const to = options.to || 'zh-Hant';
  const text = options.text || '';

  if (!text) {
    throw new Error('Empty source text.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  }

  const query = apiToken ? `?token=${encodeURIComponent(apiToken)}` : '';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}/translate${query}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ from, to, text, html: false }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MTranServer HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data && data.error ? data.error : 'Empty response from MTranServer.');
    }

    const translated = data.result || data.translatedText || '';
    if (!translated) {
      throw new Error('No translated text in response.');
    }

    return translated;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  translateWithMtran,
  normalizeApiUrl,
};
