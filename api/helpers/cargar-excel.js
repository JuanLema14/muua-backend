const axios = require("axios");
let coleccion = [];

if (accion === "cargar") {

  if (!sails.config.paths.excel) {
    throw new Error("JSON_URL no está configurada");
  }

  sails.log.info("Descargando JSON desde Supabase...");

  const response = await axios.get(sails.config.paths.excel);

  coleccion = response.data.map((fila) => ({
    numeroRegistro: limpiar(fila["Número de Registro"]),
    numeroAnterior: limpiar(fila["Número Anterior"]),
    numeroTenencia: limpiar(fila["Número de Tenencia"]),

    coleccion: limpiar(fila["Colección"]),
    tipoColeccion: limpiar(fila["Tipo de colección"]),
    area: limpiar(fila["Área"]),
    subarea: limpiar(fila["Subárea"]),
    grupoColeccion: limpiar(fila["Grupo de Colección"]),

    fechaIngresoDia: limpiar(fila["__EMPTY"]),
    fechaIngresoMes: limpiar(fila["__EMPTY_1"]),

    denominacion: limpiar(fila["Denominación del Objeto"]),
    forma: limpiar(fila["Forma"]),
    observaciones: limpiar(fila["Observaciones"]),
    categoria: limpiar(fila["Categoría"]),

    cultura: limpiar(fila["Cultura"]),
    zonaArqueologica: limpiar(fila["Zona Arqueológica"]),
    nombreSitio: limpiar(fila["Nombre Sitio Arqueológico"]),
    corregimiento: limpiar(fila["Corregimiento/inspección/vereda"]),
    ciudad: limpiar(fila["Ciudad"]),
    departamento: limpiar(fila["Departamento"]),
    pais: limpiar(fila["País"]),

    periodo: limpiar(fila["Periodo"]),
    cronologia: limpiar(fila["Cronología"]),

    materiales: limpiar(fila["Materiales"]),
    materiaPrima: limpiar(fila["Materia Prima"]),
    unidadSoporte: limpiar(fila["Unidad soporte"]),

    colorPrimero: limpiar(fila["__EMPTY_2"]),
    colorSegundo: limpiar(fila["__EMPTY_3"]),

    tecnicaElaboracion: limpiar(fila["Técnica elaboración"]),
    tecnicaDecoracion: limpiar(fila["Técnica decoración"]),
    tecnicaAcabado: limpiar(fila["Técnica acabado"]),

    unidadMedida: limpiar(fila["Unidad medida lineal"]),
    alto: limpiar(fila["Alto"]),
    ancho: limpiar(fila["Ancho"]),
    largo: limpiar(fila["Largo"]),
    profundidad: limpiar(fila["Profundidad"]),
    peso: limpiar(fila["Peso"]),

    ubicacionInterna: limpiar(fila["Ubicación Interna"]),
    mueble: limpiar(fila["__EMPTY_4"]),
    carro: limpiar(fila["__EMPTY_5"]),
    estante: limpiar(fila["__EMPTY_6"]),

    montaje: limpiar(fila["Montaje"]),
    ubicacionExterna: limpiar(fila["Ubicación Externa"]),

    revisionDia: limpiar(fila["__EMPTY_7"]),
    revisionMes: limpiar(fila["__EMPTY_8"]),

    avaluoUnicidad: limpiar(fila["__EMPTY_9"]),
    avaluoExhibicion: limpiar(fila["__EMPTY_10"]),
    avaluoDiseño: limpiar(fila["__EMPTY_11"]),
    avaluoAcabado: limpiar(fila["__EMPTY_12"]),
    avaluoInformacion: limpiar(fila["__EMPTY_13"]),
    avaluoAreaArqueologica: limpiar(fila["__EMPTY_14"]),
    avaluoAsociacion: limpiar(fila["__EMPTY_15"]),
    avaluoTecnologia: limpiar(fila["__EMPTY_16"]),
    avaluoConservacion: limpiar(fila["__EMPTY_17"]),
  }));

  coleccion = coleccion.filter(
    (p) => p.numeroRegistro !== ""
  );

  sails.log.info(
    `JSON cargado correctamente: ${coleccion.length} registros`
  );

  return {
    total: coleccion.length,
    mensaje: "JSON cargado correctamente",
  };
}
