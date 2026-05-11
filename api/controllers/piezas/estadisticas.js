module.exports = {
  friendlyName: 'Estadísticas de piezas',
  description: 'Retorna el total y conteos agrupados por campo.',

  inputs: {},

  exits: {
    success: {
      description: 'Finalización satisfactoria',
      responseType: 'okResponse',
    },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Estadísticas de piezas');

    const todas = await sails.helpers.cargarExcel.with({ accion: 'obtenerTodos' });

    return exits.success({
      total:         todas.length,
      porColeccion:  agrupar(todas, 'coleccion'),
      porArea:       agrupar(todas, 'area'),
      porCultura:    agrupar(todas, 'cultura'),
      porPeriodo:    agrupar(todas, 'periodo'),
    });
  },
};

function agrupar(arr, campo) {
  return arr.reduce((acc, p) => {
    const valor = p[campo] && p[campo].trim() !== '' ? p[campo] : 'Sin clasificar';
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});
}
