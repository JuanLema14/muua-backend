module.exports = {
  friendlyName: 'Detalle de pieza',
  description: 'Obtiene el detalle de una pieza por su código.',

  inputs: {
    codigo: { type: 'string', required: true },
  },

  exits: {
    success: {
      description: 'Finalización satisfactoria',
      responseType: 'okResponse',
    },
    notFound: {
      description: 'No se encontró la pieza con ese código.',
      responseType: 'notFound',
    },
    errorGeneral: {
      description: 'Un error sin identificar generado en el try/catch.',
      responseType: 'nokResponse',
    },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Detalle de pieza');
    try {
      const pieza = await sails.helpers.cargarExcel.with({
        accion: 'buscarPorCodigo',
        codigo: inputs.codigo,
      });
      if (!pieza) return exits.notFound();
      return exits.success(pieza);
    } catch (error) {
      sails.log.error('Error al obtener detalle de pieza', error);
      return exits.errorGeneral(error.message);
    }
  },
};
