function pad2(n){ return (n < 10 ? '0' : '') + n; }

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  if (isNaN(d)) return '';
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  if (isNaN(d)) return '';
  return String(d.getFullYear());
}

function formatRange(start, end) {
  var s = formatDate(start);
  var e = end ? formatDate(end) : 'Actualidad';
  return [s, e].filter(Boolean).join(' — ');
}

function qualBlocks(informe) {
  var map = [
    ['motivoPresentacion','Motivo de presentación'],
    ['aspectosPersonales','Aspectos personales'],
    ['trayectoriaFormativa','Trayectoria formativa'],
    ['trayectoriaProfesional','Trayectoria profesional'],
    ['datosInteres','Datos de interés']
  ];
  if (!informe) return [];
  return map
    .map(function (p) {
      var k = p[0], label = p[1];
      var val = (informe[k] || '').toString().trim();
      return val ? { key: k, label: label, value: val } : null;
    })
    .filter(Boolean);
}
