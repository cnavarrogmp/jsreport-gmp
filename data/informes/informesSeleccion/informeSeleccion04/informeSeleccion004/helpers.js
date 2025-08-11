function paragraphs(text) {
  if (!text) return [];
  return text
    .split(/\.|\n/)
    .map(function (p) { return p.trim(); })
    .filter(Boolean);
}

function hasItems(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

function formatDate(value) {
  if (!value) return '';
  try {
    var d = new Date(value);
    if (!isNaN(d)) {
      return d.toLocaleDateString('es-ES');
    }
  } catch (e) {}
  return '';
}

module.exports = { paragraphs, hasItems, formatDate };
