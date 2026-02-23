const DEFAULT_TIMEOUT_MS = 15000;

function normalizeOctopusEndpoint(endpoint) {
  const base = (endpoint || '').trim().replace(/\/+$/, '');
  if (!base) {
    return '';
  }

  if (base.endsWith('/v1/chat/completions')) {
    return base;
  }
  if (base.endsWith('/v1')) {
    return `${base}/chat/completions`;
  }
  return `${base}/v1/chat/completions`;
}

async function translateWithOctopus(options) {
  const endpoint = normalizeOctopusEndpoint(options.endpoint);
  const token = (options.token || '').trim();
  const model = (options.model || '').trim();
  const text = options.text || '';
  const from = options.from || 'auto';
  const to = options.to || 'zh-Hant';
  const systemPrompt =
    options.systemPrompt ||
    'You are a translation engine for source code comments. Return only translated text.';

  if (!endpoint) {
    throw new Error('Octopus endpoint is required.');
  }
  if (!token) {
    throw new Error('Octopus token is required.');
  }
  if (!model) {
    throw new Error('Octopus model is required.');
  }
  if (!text) {
    throw new Error('Empty source text.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Translate this code comment from ${from} to ${to}. Return translated text only.\\n${text}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Octopus HTTP ${response.status}`);
    }

    const data = await response.json();
    const translated =
      data?.choices?.[0]?.message?.content || data?.result || data?.translatedText || '';

    if (!translated) {
      throw new Error('No translated text in Octopus response.');
    }

    return String(translated).trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  normalizeOctopusEndpoint,
  translateWithOctopus,
};
