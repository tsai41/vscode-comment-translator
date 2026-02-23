function parseCommentLine(lineText) {
  if (typeof lineText !== 'string') {
    return null;
  }

  let match = lineText.match(/^(\s*)(\/\/+)\s?(.*)$/);
  if (match) {
    return {
      indent: match[1],
      markerStart: match[2],
      markerEnd: '',
      spacerAfterStart: lineText.includes(`${match[2]} `) ? ' ' : '',
      content: match[3],
    };
  }

  match = lineText.match(/^(\s*)(#|;|--)\s?(.*)$/);
  if (match) {
    return {
      indent: match[1],
      markerStart: match[2],
      markerEnd: '',
      spacerAfterStart: lineText.includes(`${match[2]} `) ? ' ' : '',
      content: match[3],
    };
  }

  match = lineText.match(/^(\s*)(\/\*)\s?(.*?)\s*(\*\/)\s*$/);
  if (match) {
    return {
      indent: match[1],
      markerStart: match[2],
      markerEnd: match[4],
      spacerAfterStart: lineText.includes(`${match[2]} `) ? ' ' : '',
      content: match[3],
    };
  }

  return null;
}

function buildTranslatedCommentLine(parsed, translatedText) {
  if (!parsed) {
    throw new Error('parsed comment is required');
  }

  const output = `${parsed.indent}${parsed.markerStart}${parsed.spacerAfterStart}${translatedText}`;
  if (parsed.markerEnd) {
    return `${output} ${parsed.markerEnd}`;
  }

  return output;
}

module.exports = {
  parseCommentLine,
  buildTranslatedCommentLine,
};
