module.exports.bootstrap = async function(done) {
  try {
    await sails.helpers.cargarExcel.with({
      accion: 'cargar'
    });

    return done();
  } catch (e) {
    return done(e);
  }
};
