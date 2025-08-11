function splitLines(text) {
  if (!text) return [];
  return text.split(/\r?\n+/).map(function (line) {
    return line.trim();
  }).filter(Boolean);
}

module.exports = {
  splitLines
};
