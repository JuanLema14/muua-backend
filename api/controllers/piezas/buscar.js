module.exports = {
  friendlyName: 'Buscar piezas',
  description: 'Busca piezas por término de búsqueda libre sobre el nombre.',

  inputs: {
    q: { type: 'string', required: true },
  },

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
    sails.log.verbose('-----> Buscar piezas');
    try {
      const resultado = await sails.helpers.cargarExcel.with({
        accion: 'filtrar',
        filtros: { q: inputs.q },
      });
      return exits.success(resultado);
    } catch (error) {
      sails.log.error('Error al buscar piezas', error);
      return exits.errorGeneral(error.message);
    }
  },
};
