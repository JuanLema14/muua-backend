/* eslint-disable camelcase */
const XLSX = require("xlsx");
const axios = require("axios");
const flaverr = require("flaverr");

// Caché en memoria
let coleccion = [];

module.exports = {
  friendlyName: "Cargar excel",
  description: "Carga y consulta información del archivo Excel - Hoja ICANH",

  inputs: {
    filtros: { type: "ref", required: false },
    codigo: { type: "string", required: false },
    accion: {
      type: "string",
      required: true,
      isIn: ["cargar", "obtenerTodos", "buscarPorCodigo", "filtrar"],
    },
  },

  exits: {
    success: { description: "Proceso ejecutado correctamente." },
    error: { description: "Ocurrió un error." },
  },

  fn: async function ({ accion, filtros, codigo }) {
    sails.log.verbose("-----> Helper Excel");

    try {
      // =========================
      // CARGAR EXCEL
      // =========================
      if (accion === "cargar") {

        if (!sails.config.paths.excel) {
          throw new Error(
            "La variable de entorno EXCEL_URL no está configurada."
          );
        }

        sails.log.info("Descargando Excel desde Supabase...");

        const response = await axios.get(sails.config.paths.excel, {
          responseType: "arraybuffer",
        });

        const workbook = XLSX.read(response.data, {
          type: "buffer",
        });

        sails.log.info("Excel descargado correctamente.");

        // Leer específicamente la hoja ICANH
        const nombreHoja = "ICANH";

        if (!workbook.Sheets[nombreHoja]) {
          throw new Error(
            `No se encontró la hoja "${nombreHoja}" en el Excel. Hojas disponibles: ${workbook.SheetNames.join(", ")}`
          );
        }

        const hoja = workbook.Sheets[nombreHoja];

        const filas = XLSX.utils.sheet_to_json(hoja, {
          defval: "",
        });

        if (filas.length > 0) {
          sails.log.info(
            "Columnas detectadas:",
            Object.keys(filas[0])
          );
        }

        coleccion = filas.map((fila) => ({
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
          `ExcelHelper: ${coleccion.length} piezas cargadas desde hoja ICANH.`
        );

        return {
          total: coleccion.length,
          mensaje: "Excel cargado correctamente.",
        };
      }

      // =========================
      // OBTENER TODOS
      // =========================
      if (accion === "obtenerTodos") {
        return coleccion;
      }

      // =========================
      // BUSCAR POR CÓDIGO
      // =========================
      if (accion === "buscarPorCodigo") {
        return (
          coleccion.find(
            (p) => p.numeroRegistro === codigo
          ) || null
        );
      }

      // =========================
      // FILTRAR
      // =========================
      if (accion === "filtrar") {
        let resultado = coleccion;

        const {
          coleccion: filtColeccion,
          area,
          cultura,
          periodo,
          q,
          page = 1,
          limit = 20,
        } = filtros || {};

        if (filtColeccion) {
          resultado = resultado.filter(
            (p) => p.coleccion === filtColeccion
          );
        }

        if (area) {
          resultado = resultado.filter(
            (p) => p.area === area
          );
        }

        if (cultura) {
          resultado = resultado.filter(
            (p) => p.cultura === cultura
          );
        }

        if (periodo) {
          resultado = resultado.filter(
            (p) => p.periodo === periodo
          );
        }

        if (q) {
          const texto = q.toLowerCase();

          resultado = resultado.filter(
            (p) =>
              p.denominacion.toLowerCase().includes(texto) ||
              p.observaciones.toLowerCase().includes(texto)
          );
        }

        const total = resultado.length;
        const inicio = (page - 1) * limit;
        const datos = resultado.slice(
          inicio,
          inicio + limit
        );

        return {
          total,
          page,
          limit,
          datos,
        };
      }
    } catch (error) {
      sails.log.error("Error cargando Excel:", error);
      throw flaverr({ code: "E_EXCEL_HELPER" }, error);
    }
  },
};

function limpiar(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return valor.toString().trim();
}
