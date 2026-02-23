function normalizeDisplayMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'hover') {
    return 'hover';
  }
  return 'codelens';
}

module.exports = {
  normalizeDisplayMode,
};
