// api/controllers/piezas/imagenes.js
const https = require('https')

module.exports = {
  friendlyName: 'Imágenes de pieza',
  description: 'Devuelve las URLs de imágenes de una pieza desde MyCloud.',

  inputs: {
    codigo: { type: 'string', required: true },
  },

  exits: {
    success: { responseType: 'okResponse' },
    notFound: { responseType: 'notFound' },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Imágenes de pieza:', inputs.codigo)

    const { ids, token } = await sails.helpers.mycloudImages.with({
      accion: 'buscar',
      numeroRegistro: inputs.codigo,
    })

    if (!ids.length) return exits.notFound()

    const BASE_URL = sails.config.mycloud.baseUrl

    // Construir URLs de thumbnail y full para cada imagen
    const imagenes = ids.map((id, index) => ({
      index,
      thumbnail: `${BASE_URL}/sdk/v3/files/${id}/content?size=200c&cacheControlMaxAge=600&access_token=${token}`,
      full:      `${BASE_URL}/sdk/v3/files/${id}/content?cacheControlMaxAge=600&access_token=${token}`,
    }))

    return exits.success(imagenes)
  },
}
