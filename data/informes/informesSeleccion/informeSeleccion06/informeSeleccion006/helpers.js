// Devolver true si alguno de los argumentos (excepto el último, que es options) es truthy
function or() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
}

// (Opcional) AND lógico por si lo necesitas en el futuro
function and() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(Boolean);
}

// formatea fechas muy simple: ahora solo usamos 'year'
function formatDate(date, part) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  if (part === 'year') return d.getFullYear();
  return d.toISOString();
}

// separa texto en párrafos por líneas en blanco
function splitParagraphs(str) {
  if (!str) return [];
  return String(str)
    .trim()
    .split(/\r?\n\s*\r?\n/) // párrafos separados por una o más líneas en blanco
    .map(s => s.trim())
    .filter(Boolean);
}

// compone rango de fechas "YYYY - YYYY/Actual"
function formatDateRange(start, end) {
  const startYear = formatDate(start, 'year') || 'N/D';
  const endYear = end ? formatDate(end, 'year') : 'Actual';
  return `${startYear} - ${endYear}`;
}
