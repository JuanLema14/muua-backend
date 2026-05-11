// api/controllers/piezas/reporte.js
const ExcelJS = require('exceljs')

module.exports = {
  friendlyName: 'Generar reporte ICANH',
  description: 'Genera un archivo .xlsx con la ficha ICANH de una pieza.',

  inputs: {
    codigos: {
      type: 'ref',
      required: true,
      description: 'Array con el número de registro de la pieza.',
    },
  },

  exits: {
    success: { description: 'Archivo generado correctamente.' },
    notFound: { responseType: 'notFound' },
    errorGeneral: { responseType: 'nokResponse' },
  },

  fn: async function (inputs, exits) {
    sails.log.verbose('-----> Generar reporte ICANH');

    try {
      const codigo = inputs.codigos[0]

      // Buscar la pieza
      const pieza = await sails.helpers.cargarExcel.with({
        accion: 'buscarPorCodigo',
        codigo,
      })

      if (!pieza) return exits.notFound()

      // Crear el workbook
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Ficha ICANH')

      // Estilos base
      const estiloBorde = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      }
      const estiloTitulo = {
        font:      { bold: true, size: 11 },
        fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
        border:    estiloBorde,
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
      }
      const estiloHeader = {
        font:      { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
        fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } },
        border:    estiloBorde,
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      }
      const estiloValor = {
        font:      { size: 10 },
        border:    estiloBorde,
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
      }
      const estiloSeccion = {
        font:      { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
        fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } },
        border:    estiloBorde,
        alignment: { vertical: 'middle', horizontal: 'left' },
      }

      // Anchos de columna
      sheet.columns = [
        { width: 22 }, { width: 22 }, { width: 22 },
        { width: 22 }, { width: 22 }, { width: 22 },
      ]

      // ===== ENCABEZADO =====
      sheet.mergeCells('A1:F1')
      const celdaMuseo = sheet.getCell('A1')
      celdaMuseo.value = 'Museo Universitario de la Universidad de Antioquia\nColección de Antropología'
      Object.assign(celdaMuseo, estiloHeader)
      sheet.getRow(1).height = 40

      sheet.mergeCells('A2:F2')
      const celdaTitulo = sheet.getCell('A2')
      celdaTitulo.value = 'FICHA ÚNICA PARA REGISTRO DE BIENES MUEBLES\nPERTENECIENTES AL PATRIMONIO NACIONAL'
      Object.assign(celdaTitulo, { ...estiloHeader, font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } } })
      sheet.getRow(2).height = 35

      // ===== SECCIÓN 1: IDENTIFICACIÓN =====
      sheet.mergeCells('A3:F3')
      sheet.getCell('A3').value = '1. IDENTIFICACIÓN DE LA PIEZA'
      Object.assign(sheet.getCell('A3'), estiloSeccion)
      sheet.getRow(3).height = 20

      fila(sheet, 4, estiloTitulo, estiloValor, [
        { label: 'Código', valor: pieza.numeroRegistro, cols: 1 },
        { label: 'Nombre descriptivo', valor: pieza.denominacion, cols: 3 },
      ])
      fila(sheet, 5, estiloTitulo, estiloValor, [
        { label: 'Número anterior', valor: pieza.numeroAnterior, cols: 1 },
        { label: 'Tipo de material', valor: pieza.materiales, cols: 2 },
        { label: 'Clase fotografía', valor: 'Digital', cols: 1 },
      ])

      // ===== SECCIÓN 2: CLASIFICACIÓN =====
      sheet.mergeCells('A6:F6')
      sheet.getCell('A6').value = '2. CLASIFICACIÓN'
      Object.assign(sheet.getCell('A6'), estiloSeccion)

      fila(sheet, 7, estiloTitulo, estiloValor, [
        { label: 'Colección', valor: pieza.coleccion, cols: 2 },
        { label: 'Tipo de colección', valor: pieza.tipoColeccion, cols: 2 },
        { label: 'Área', valor: pieza.area, cols: 2 },
      ])
      fila(sheet, 8, estiloTitulo, estiloValor, [
        { label: 'Subárea', valor: pieza.subarea, cols: 2 },
        { label: 'Grupo de colección', valor: pieza.grupoColeccion, cols: 4 },
      ])

      // ===== SECCIÓN 3: PROCEDENCIA =====
      sheet.mergeCells('A9:F9')
      sheet.getCell('A9').value = '3. PROCEDENCIA'
      Object.assign(sheet.getCell('A9'), estiloSeccion)

      fila(sheet, 10, estiloTitulo, estiloValor, [
        { label: 'País', valor: pieza.pais, cols: 2 },
        { label: 'Departamento', valor: pieza.departamento, cols: 2 },
        { label: 'Ciudad', valor: pieza.ciudad, cols: 2 },
      ])
      fila(sheet, 11, estiloTitulo, estiloValor, [
        { label: 'Corregimiento/inspección/vereda', valor: pieza.corregimiento, cols: 3 },
        { label: 'Zona arqueológica', valor: pieza.zonaArqueologica, cols: 3 },
      ])

      // ===== SECCIÓN 4: DESCRIPCIÓN =====
      sheet.mergeCells('A12:F12')
      sheet.getCell('A12').value = '4. DESCRIPCIÓN DE LA PIEZA'
      Object.assign(sheet.getCell('A12'), estiloSeccion)

      fila(sheet, 13, estiloTitulo, estiloValor, [
        { label: 'Cultura', valor: pieza.cultura, cols: 2 },
        { label: 'Periodo', valor: pieza.periodo, cols: 2 },
        { label: 'Cronología', valor: pieza.cronologia, cols: 2 },
      ])
      fila(sheet, 14, estiloTitulo, estiloValor, [
        { label: 'Forma', valor: pieza.forma, cols: 2 },
        { label: 'Categoría conservación', valor: pieza.categoria, cols: 2 },
        { label: 'Materiales', valor: pieza.materiales, cols: 2 },
      ])
      fila(sheet, 15, estiloTitulo, estiloValor, [
        { label: 'Técnica elaboración', valor: pieza.tecnicaElaboracion, cols: 2 },
        { label: 'Técnica decoración', valor: pieza.tecnicaDecoracion, cols: 2 },
        { label: 'Técnica acabado', valor: pieza.tecnicaAcabado, cols: 2 },
      ])
      fila(sheet, 16, estiloTitulo, estiloValor, [
        { label: 'Alto (cm)', valor: pieza.alto, cols: 1 },
        { label: 'Ancho (cm)', valor: pieza.ancho, cols: 1 },
        { label: 'Largo (cm)', valor: pieza.largo, cols: 1 },
        { label: 'Profundidad (cm)', valor: pieza.profundidad, cols: 1 },
        { label: 'Peso (g)', valor: pieza.peso, cols: 2 },
      ])
      fila(sheet, 17, estiloTitulo, estiloValor, [
        { label: 'Color primario', valor: pieza.colorPrimero, cols: 2 },
        { label: 'Color secundario', valor: pieza.colorSegundo, cols: 2 },
        { label: 'Unidad medida', valor: pieza.unidadMedida, cols: 2 },
      ])

      // Observaciones — fila alta
      sheet.getCell('A18').value = 'Observaciones'
      Object.assign(sheet.getCell('A18'), estiloTitulo)
      sheet.mergeCells('B18:F18')
      sheet.getCell('B18').value = pieza.observaciones || '—'
      Object.assign(sheet.getCell('B18'), estiloValor)
      sheet.getRow(18).height = 60

      // ===== SECCIÓN 5: DATOS ADMINISTRATIVOS =====
      sheet.mergeCells('A19:F19')
      sheet.getCell('A19').value = '5. DATOS ADMINISTRATIVOS'
      Object.assign(sheet.getCell('A19'), estiloSeccion)

      fila(sheet, 20, estiloTitulo, estiloValor, [
        { label: 'Tenedor', valor: 'Museo Universitario de la Universidad de Antioquia', cols: 4 },
        { label: 'Tipo de tenedor', valor: 'Entidad pública', cols: 2 },
      ])
      fila(sheet, 21, estiloTitulo, estiloValor, [
        { label: 'NIT', valor: '890.980.040-8', cols: 2 },
        { label: 'Teléfono', valor: '(4) 219 5180', cols: 2 },
        { label: 'Email', valor: 'antropologiamuseo@udea.edu.co', cols: 2 },
      ])
      fila(sheet, 22, estiloTitulo, estiloValor, [
        { label: 'Dirección', valor: 'Calle 67 Nº 53-108. Bloque 15. Medellín', cols: 4 },
        { label: 'Ciudad', valor: 'Medellín', cols: 2 },
      ])
      fila(sheet, 23, estiloTitulo, estiloValor, [
        { label: 'Ubicación interna', valor: `Mueble: ${pieza.mueble} | Carro: ${pieza.carro} | Estante: ${pieza.estante}`, cols: 4 },
        { label: 'Montaje', valor: pieza.montaje || '—', cols: 2 },
      ])

      // Pie de página
      sheet.mergeCells('A24:F24')
      sheet.getCell('A24').value = 'Dirección: Calle 67 N° 53-108. Bloque 15. Teléfono: (4) 219 5180. Internet: http://museo.udea.edu.co'
      sheet.getCell('A24').font = { italic: true, size: 9, color: { argb: 'FF666666' } }
      sheet.getCell('A24').alignment = { horizontal: 'center' }

      // Generar buffer y enviar
      const buffer = await workbook.xlsx.writeBuffer()

      const nombreArchivo = `ICANH_${pieza.numeroRegistro.replace(/\s/g, '_')}.xlsx`

      this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      this.res.set('Content-Disposition', `attachment; filename="${nombreArchivo}"`)
      return this.res.send(buffer)

    } catch (error) {
      sails.log.error('Error generando reporte ICANH:', error)
      return exits.errorGeneral(error.message)
    }
  },
}

// Función auxiliar para escribir una fila con celdas label+valor
function fila(sheet, numFila, estiloLabel, estiloValor, campos) {
  let colActual = 1
  for (const campo of campos) {
    const colFin = colActual + campo.cols - 1

    // Celda label
    const celdaLabel = sheet.getCell(numFila, colActual)
    celdaLabel.value = campo.label
    Object.assign(celdaLabel, estiloLabel)

    // Si tiene más de 1 columna, mergear para el valor
    if (campo.cols > 1) {
      // Label ocupa solo la primera columna, valor ocupa el resto
      const letraInicio = colToLetter(colActual + 1)
      const letraFin = colToLetter(colFin)
      if (colActual + 1 <= colFin) {
        sheet.mergeCells(`${letraInicio}${numFila}:${letraFin}${numFila}`)
      }
      const celdaValor = sheet.getCell(numFila, colActual + 1)
      celdaValor.value = campo.valor || '—'
      Object.assign(celdaValor, estiloValor)
    } else {
      // Label y valor en la misma celda
      celdaLabel.value = `${campo.label}: ${campo.valor || '—'}`
    }

    colActual = colFin + 1
  }
  sheet.getRow(numFila).height = 22
}

function colToLetter(col) {
  let letter = ''
  while (col > 0) {
    const rem = (col - 1) % 26
    letter = String.fromCharCode(65 + rem) + letter
    col = Math.floor((col - 1) / 26)
  }
  return letter
}
