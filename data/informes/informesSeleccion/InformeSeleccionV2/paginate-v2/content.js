function beforeRender(req, res, done) {
    var d = req.data || {};

    var arrays = [
        'acreditaciones','adjuntos','competencias','experienciasLaborales',
        'formaciones','idiomas','aplicacionesInformaticas','referencias'
    ];
    arrays.forEach(function (k) {
        d[k] = Array.isArray(d[k]) ? d[k] : [];
    });

    var qualKeys = [
        'motivoPresentacion','aspectosPersonales','trayectoriaFormativa',
        'trayectoriaProfesional','datosInteres','entrevistaPersonal',
        'valoracion','potencial'
    ];
    var qualChars = d.informe
        ? qualKeys.reduce(function (acc, k) { return acc + ((d.informe[k] || '').length); }, 0)
        : 0;

    var listItems = arrays.reduce(function (acc, k) {
        return acc + ((d[k] && d[k].length) || 0);
    }, 0);

    d.__layout = { isLandscape: (qualChars > 8000 || listItems > 120) };
    req.data = d;

    done();
}
