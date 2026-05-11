/**
 * nokResponse.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.nokResponse();
 *     // -or-
 *     return res.nokResponse(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'nokResponse'
 *       }
 *     }
 * ```
 *
 * ```
 *     throw 'somethingHappened';
 *     // -or-
 *     throw { somethingHappened: optionalData }
 * ```
 */

module.exports = function okResponse(datos) {
  sails.log.verbose('---> Ran custom response: res.okResponse()');

  var res = this.res;

  let ejecucion = {
    respuesta: {
      estado: 'OK',
      mensaje: 'Ejecución satisfactoria',
    },
    datos: datos || {},
  };

  return res.status(200).send({ ejecucion });
};
