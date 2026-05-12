/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'GET /api/piezas':         { action: 'piezas/listar' },
  'GET /api/piezas/buscar':  { action: 'piezas/buscar' },
  'GET /api/piezas/:codigo': { action: 'piezas/detalle' },
  'GET /api/estadisticas':   { action: 'piezas/estadisticas' },
  'POST /api/reporte':       { action: 'piezas/reporte' },
  'POST /api/reporte-pdf': { action: 'piezas/reportepdf' },
};
