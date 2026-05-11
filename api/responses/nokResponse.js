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

module.exports = function nokResponse(optionalData) {
  sails.log.verbose('Ran custom response: res.nokResponse()');

  var res = this.res;

  // Define the status code to send in the response.
  var statusCodeToSet = 200;

  // Define el objeto defecto de respuesta
  let ejecucion = {
    respuesta: {
      estado: 'NOK',
      mensaje: optionalData || 'Error en la ejecución',
    },
  };

  // If no data was provided, use res.sendStatus().
  if (optionalData === undefined) {
    sails.log.info('optionalData === undefined res.notFound()');
    return res.sendStatus(statusCodeToSet);
  }

  // Else if the provided data is an Error instance, if it has
  // a toJSON() function, then always run it and use it as the
  // response body to send.  Otherwise, send down its `.stack`,
  // except in production use res.sendStatus().
  else if (_.isError(optionalData)) {
    sails.log.info(
      'Custom response `res.notFound()` called with an Error:',
      optionalData
    );

    // If the error doesn't have a custom .toJSON(), use its `stack` instead--
    // otherwise res.json() would turn it into an empty dictionary.
    // (If this is production, don't send a response body at all.)
    if (!_.isFunction(optionalData.toJSON)) {
      if (process.env.NODE_ENV !== 'production') {
        return res.status(statusCodeToSet).send({ ejecucion: ejecucion });
      } else {
        return res.status(statusCodeToSet).send(optionalData.stack);
      }
    }
  }
  sails.log.info(
    'Custom response `res.notFound()` called with a object ',
    optionalData
  );
  return res.status(statusCodeToSet).send({ ejecucion: ejecucion });
};
