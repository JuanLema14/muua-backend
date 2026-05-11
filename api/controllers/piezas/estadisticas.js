module.exports = {
  friendlyName: 'Estadísticas de piezas',
  description: 'Retorna el total y el conteo agrupado por tipo.',

  inputs: {},

  exits: {
    success: {
      description: 'Finalización satisfactoria',
      responseType: 'okResponse',
    },
    errorGeneral: {
      description: 'Un error sin identificar generado en el try/catch.',
      responseType: 'nokResponse',
    },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Estadísticas de piezas');
    try {
      const todas = await sails.helpers.cargarExcel.with({ accion: 'obtenerTodos' });
      const porTipo = todas.reduce((acc, p) => {
        acc[p.tipo] = (acc[p.tipo] || 0) + 1;
        return acc;
      }, {});
      return exits.success({ total: todas.length, porTipo });
    } catch (error) {
      sails.log.error('Error al obtener estadísticas', error);
      return exits.errorGeneral(error.message);
    }
  },
};
