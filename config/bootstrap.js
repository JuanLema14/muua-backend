module.exports.bootstrap = async function (done) {
  try {
    await sails.helpers.cargarExcel.with({ accion: 'cargar' })
    return done()
  } catch (error) {
    sails.log.error('Error en bootstrap:', error)
    return done(error)
  }
}
