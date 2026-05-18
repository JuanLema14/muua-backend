/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function (done) {
  try {
    await sails.helpers.cargarExcel.with({ accion: 'cargar' })
    await sails.helpers.mycloudImages.with({ accion: 'cargar' })
    return done()
  } catch (error) {
    sails.log.error('Error en bootstrap:', error)
    return done(error)
  }
}
