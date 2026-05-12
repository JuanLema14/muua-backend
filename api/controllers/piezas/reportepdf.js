// api/controllers/piezas/reportePdf.js
const PDFDocument = require('pdfkit')

module.exports = {
  friendlyName: 'Generar reporte PDF ICANH',
  description: 'Genera un PDF con la ficha ICANH de una pieza.',

  inputs: {
    codigos: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    success:      { description: 'PDF generado correctamente.' },
    notFound:     { responseType: 'notFound' },
    errorGeneral: { responseType: 'nokResponse' },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Generar reporte PDF ICANH');

    try {
      const codigo = inputs.codigos[0]

      const pieza = await sails.helpers.cargarExcel.with({
        accion: 'buscarPorCodigo',
        codigo,
      })

      if (!pieza) return exits.notFound()

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      })

      // Colores
      const AZUL_OSCURO  = '#1F3864'
      const GRIS_HEADER  = '#D9D9D9'
      const GRIS_SECCION = '#2E4057'
      const NEGRO        = '#000000'
      const BLANCO       = '#FFFFFF'

      // Dimensiones
      const PW    = doc.page.width - 80   // ancho útil
      const LEFT  = 40
      let   Y     = 40

      // ── Helpers ─────────────────────────────────────────────
      function rectFill(color, x, y, w, h) {
        doc.rect(x, y, w, h).fill(color)
      }

      function rectBorder(x, y, w, h) {
        doc.rect(x, y, w, h).stroke(NEGRO)
      }

      function texto(txt, x, y, opts = {}) {
        doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(opts.size || 9)
           .fillColor(opts.color || NEGRO)
           .text(txt || '—', x, y, {
             width:    opts.width  || 200,
             height:   opts.height || 20,
             ellipsis: true,
             lineBreak: opts.lineBreak !== undefined ? opts.lineBreak : false,
           })
      }

      // Fila de celdas: [{ label, valor, w }]
      function filaTabla(celdas, y, h = 22) {
        let x = LEFT
        for (const c of celdas) {
          // Fondo label
          rectFill(GRIS_HEADER, x, y, c.w * 0.38, h)
          rectBorder(x, y, c.w, h)
          // Label
          texto(c.label, x + 3, y + 6, { bold: true, size: 8, width: c.w * 0.36 })
          // Valor
          texto(c.valor, x + c.w * 0.38 + 3, y + 6, { size: 8, width: c.w * 0.58 })
          x += c.w
        }
        return y + h
      }

      function seccion(titulo, y) {
        rectFill(GRIS_SECCION, LEFT, y, PW, 18)
        texto(titulo, LEFT + 4, y + 4, { bold: true, size: 9, color: BLANCO })
        return y + 18
      }

      // ── ENCABEZADO ───────────────────────────────────────────
      rectFill(AZUL_OSCURO, LEFT, Y, PW, 36)
      texto('Museo Universitario de la Universidad de Antioquia', LEFT + 4, Y + 4, {
        bold: true, size: 10, color: BLANCO, width: PW - 8
      })
      texto('Colección de Antropología', LEFT + 4, Y + 17, {
        size: 9, color: BLANCO, width: PW - 8
      })
      Y += 36

      rectFill(AZUL_OSCURO, LEFT, Y, PW, 28)
      texto('FICHA ÚNICA PARA REGISTRO DE BIENES MUEBLES', LEFT + 4, Y + 4, {
        bold: true, size: 10, color: BLANCO, width: PW - 8
      })
      texto('PERTENECIENTES AL PATRIMONIO NACIONAL', LEFT + 4, Y + 16, {
        bold: true, size: 9, color: BLANCO, width: PW - 8
      })
      Y += 28

      // ── SECCIÓN 1: IDENTIFICACIÓN ────────────────────────────
      Y = seccion('1. IDENTIFICACIÓN DE LA PIEZA', Y)

      const W3 = PW / 3
      Y = filaTabla([
        { label: 'Código',            valor: pieza.numeroRegistro, w: W3 },
        { label: 'Nombre descriptivo',valor: pieza.denominacion,   w: W3 * 2 },
      ], Y)
      Y = filaTabla([
        { label: 'Número anterior',   valor: pieza.numeroAnterior,  w: W3 },
        { label: 'Tipo de material',  valor: pieza.materiales,      w: W3 },
        { label: 'Clase fotografía',  valor: 'Digital',             w: W3 },
      ], Y)

      // ── SECCIÓN 2: CLASIFICACIÓN ─────────────────────────────
      Y = seccion('2. CLASIFICACIÓN', Y)

      Y = filaTabla([
        { label: 'Colección',         valor: pieza.coleccion,      w: W3 },
        { label: 'Tipo de colección', valor: pieza.tipoColeccion,  w: W3 },
        { label: 'Área',              valor: pieza.area,           w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Subárea',           valor: pieza.subarea,        w: W3 },
        { label: 'Grupo de colección',valor: pieza.grupoColeccion, w: W3 * 2 },
      ], Y)

      // ── SECCIÓN 3: PROCEDENCIA ───────────────────────────────
      Y = seccion('3. PROCEDENCIA', Y)

      Y = filaTabla([
        { label: 'País',              valor: pieza.pais,           w: W3 },
        { label: 'Departamento',      valor: pieza.departamento,   w: W3 },
        { label: 'Ciudad',            valor: pieza.ciudad,         w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Corregimiento/inspección/vereda', valor: pieza.corregimiento,   w: W3 * 2 },
        { label: 'Zona arqueológica', valor: pieza.zonaArqueologica, w: W3 },
      ], Y)

      // ── SECCIÓN 4: DESCRIPCIÓN ───────────────────────────────
      Y = seccion('4. DESCRIPCIÓN DE LA PIEZA', Y)

      Y = filaTabla([
        { label: 'Cultura',           valor: pieza.cultura,        w: W3 },
        { label: 'Periodo',           valor: pieza.periodo,        w: W3 },
        { label: 'Cronología',        valor: pieza.cronologia,     w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Forma',             valor: pieza.forma,          w: W3 },
        { label: 'Categoría',         valor: pieza.categoria,      w: W3 },
        { label: 'Materiales',        valor: pieza.materiales,     w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Técnica elaboración',  valor: pieza.tecnicaElaboracion, w: W3 },
        { label: 'Técnica decoración',   valor: pieza.tecnicaDecoracion,  w: W3 },
        { label: 'Técnica acabado',      valor: pieza.tecnicaAcabado,     w: W3 },
      ], Y)

      const W6 = PW / 6
      Y = filaTabla([
        { label: 'Alto (cm)',    valor: pieza.alto,        w: W6 },
        { label: 'Ancho (cm)',   valor: pieza.ancho,       w: W6 },
        { label: 'Largo (cm)',   valor: pieza.largo,       w: W6 },
        { label: 'Prof. (cm)',   valor: pieza.profundidad, w: W6 },
        { label: 'Peso (g)',     valor: pieza.peso,        w: W6 },
        { label: 'Unidad',       valor: pieza.unidadMedida,w: W6 },
      ], Y)

      Y = filaTabla([
        { label: 'Color primario',   valor: pieza.colorPrimero, w: W3 },
        { label: 'Color secundario', valor: pieza.colorSegundo, w: W3 },
        { label: 'Color terciario',  valor: pieza.colorTercero, w: W3 },
      ], Y)

      // Observaciones — celda alta
      const obsH = 50
      rectFill(GRIS_HEADER, LEFT, Y, PW * 0.2, obsH)
      rectBorder(LEFT, Y, PW, obsH)
      texto('Observaciones', LEFT + 3, Y + 6, { bold: true, size: 8, width: PW * 0.18 })
      doc.font('Helvetica').fontSize(8).fillColor(NEGRO)
         .text(pieza.observaciones || '—', LEFT + PW * 0.2 + 4, Y + 6, {
           width: PW * 0.78, height: obsH - 10, lineBreak: true,
         })
      Y += obsH

      // ── SECCIÓN 5: DATOS ADMINISTRATIVOS ────────────────────
      Y = seccion('5. DATOS ADMINISTRATIVOS', Y)

      Y = filaTabla([
        { label: 'Tenedor',       valor: 'Museo Universitario de la Universidad de Antioquia', w: W3 * 2 },
        { label: 'Tipo tenedor',  valor: 'Entidad pública', w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'NIT',           valor: '890.980.040-8',                 w: W3 },
        { label: 'Teléfono',      valor: '(4) 219 5180',                  w: W3 },
        { label: 'Email',         valor: 'antropologiamuseo@udea.edu.co', w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Dirección',     valor: 'Calle 67 Nº 53-108. Bloque 15. Medellín', w: W3 * 2 },
        { label: 'Ciudad',        valor: 'Medellín', w: W3 },
      ], Y)
      Y = filaTabla([
        { label: 'Ubicación',     valor: `Mueble: ${pieza.mueble || '—'} | Carro: ${pieza.carro || '—'} | Estante: ${pieza.estante || '—'}`, w: W3 * 2 },
        { label: 'Montaje',       valor: pieza.montaje || '—', w: W3 },
      ], Y)

      // ── PIE DE PÁGINA ────────────────────────────────────────
      Y += 10
      doc.font('Helvetica').fontSize(8).fillColor('#666666')
         .text(
           'Dirección: Calle 67 N° 53-108. Bloque 15. Teléfono: (4) 219 5180. Internet: http://museo.udea.edu.co',
           LEFT, Y, { width: PW, align: 'center' }
         )

      // ── ENVIAR RESPUESTA ─────────────────────────────────────
      const nombreArchivo = `ICANH_${pieza.numeroRegistro.replace(/\s/g, '_')}.pdf`

      this.res.set('Content-Type', 'application/pdf')
      this.res.set('Content-Disposition', `attachment; filename="${nombreArchivo}"`)

      doc.pipe(this.res)
      doc.end()

    } catch (error) {
      sails.log.error('Error generando PDF ICANH:', error)
      return exits.errorGeneral(error.message)
    }
  },
}
