module.exports = async function (reporter, req) {
  const d = req.data || {};
  const arrays = ['acreditaciones','adjuntos','competencias','experienciasLaborales','formaciones','idiomas','aplicacionesInformaticas','referencias'];
  arrays.forEach(k => { d[k] = Array.isArray(d[k]) ? d[k] : []; });
  const qualKeys = ['motivoPresentacion','aspectosPersonales','trayectoriaFormativa','trayectoriaProfesional','datosInteres','entrevistaPersonal','valoracion','potencial'];
  const qualChars = d.informe ? qualKeys.reduce((acc,k)=> acc + ((d.informe[k]||'').length), 0) : 0;
  const listItems = arrays.reduce((acc,k)=> acc + (d[k]?.length || 0), 0);
  d.__layout = { isLandscape: (qualChars > 8000 || listItems > 120) };
  req.data = d;
};