const { translateWithMtran, normalizeApiUrl } = require('./mtranClient');
const { translateWithOctopus, normalizeOctopusEndpoint } = require('./providers/octopusProvider');

function normalizeProviderName(provider) {
  const value = String(provider || '').trim().toLowerCase();
  if (value === 'octopus') {
    return 'octopus';
  }
  return 'mtran';
}

function buildProviderCacheScope(settings) {
  const provider = normalizeProviderName(settings.provider);
  if (provider === 'octopus') {
    return JSON.stringify({
      provider,
      endpoint: normalizeOctopusEndpoint(settings.octopusEndpoint),
      model: (settings.octopusModel || '').trim(),
    });
  }

  return JSON.stringify({
    provider,
    apiUrl: normalizeApiUrl(settings.apiUrl),
  });
}

async function translateText(settings, payload) {
  const provider = normalizeProviderName(settings.provider);

  if (provider === 'octopus') {
    return translateWithOctopus({
      endpoint: settings.octopusEndpoint,
      token: settings.octopusToken,
      model: settings.octopusModel,
      systemPrompt: settings.octopusSystemPrompt,
      from: payload.from,
      to: payload.to,
      text: payload.text,
    });
  }

  return translateWithMtran({
    apiUrl: settings.apiUrl,
    apiToken: settings.apiToken,
    from: payload.from,
    to: payload.to,
    text: payload.text,
  });
}

module.exports = {
  normalizeProviderName,
  buildProviderCacheScope,
  translateText,
};
