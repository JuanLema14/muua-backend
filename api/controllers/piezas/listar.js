module.exports = {
  friendlyName: "Listar piezas",
  description: "Obtiene una lista filtrada y paginada de piezas.",

  inputs: {
    coleccion: { type: "string" },
    area: { type: "string" },
    cultura: { type: "string" },
    periodo: { type: "string" },
    page: { type: "number" },
    limit: { type: "number" },
  },

  exits: {
    success: {
      description: "Finalización satisfactoria",
      responseType: "okResponse",
    },
    errorGeneral: {
      description: "Un error sin identificar generado en el try/catch.",
      responseType: "nokResponse",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose("-----> Listar piezas");
    const { coleccion, area, cultura, periodo, q, page, limit } = inputs;
    const resultado = await sails.helpers.cargarExcel.with({
      accion: "filtrar",
      filtros: {
        coleccion,
        area,
        cultura,
        periodo,
        q,
        page: page || 1,
        limit: limit || 20,
      },
    });

    // Pasar total y datos por separado al okResponse
    return exits.success({
      total: resultado.total,
      page: resultado.page,
      limit: resultado.limit,
      datos: resultado.datos,
    });
  },
};
