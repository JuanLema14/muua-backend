// api/helpers/mycloud-images.js
const https = require("https");

// Índice en memoria: { "1": ["fileId1", "fileId2"], "29": ["fileId1"] }
let indiceImagenes = {};
let cargado = false;

module.exports = {
  friendlyName: "MyCloud Images",
  description: "Gestiona el índice de imágenes desde WD MyCloud",

  inputs: {
    accion: {
      type: "string",
      required: true,
      isIn: ["cargar", "buscar"],
    },
    numeroRegistro: {
      type: "string",
      required: false,
    },
  },

  exits: {
    success: { description: "OK" },
  },

  fn: async function ({ accion, numeroRegistro }) {
    if (accion === "cargar") {
      sails.log.info("MyCloud: cargando índice de imágenes...");
      indiceImagenes = {};

      const BASE_URL = sails.config.mycloud.baseUrl;
      const FOLDER_ID = sails.config.mycloud.folderId;

      let pageToken = "";
      let pagina = 0;

      do {
        const fields = "pageToken,id,name,mimeType";
        const url = `${BASE_URL}/sdk/v2/filesSearch/parents?pretty=false&ids=${FOLDER_ID}&fields=${fields}&limit=100&pageToken=${pageToken}&orderBy=name&order=asc`;

        const TOKEN = sails.config.mycloud.accessToken;
        const datos = await fetchJson(url, TOKEN);
        console.log("datos:", datos);
        if (!datos || !datos.files) break;

        for (const archivo of datos.files) {
          // Solo imágenes con nombre numérico: "1 (1).JPG", "29 (3).JPG"
          sails.log.info("Archivo encontrado:", archivo.name);
          const match = archivo.name.match(
            /^(\d+)\s*\((\d+)\)\.(jpg|JPG|jpeg|JPEG)$/,
          );
          if (!match) continue;

          const numero = match[1]; // "1", "29", etc.
          if (!indiceImagenes[numero]) indiceImagenes[numero] = [];
          indiceImagenes[numero].push(archivo.id);
        }

        pageToken = datos.pageToken || "";
        pagina++;

        // Seguridad: máximo 50 páginas (5000 archivos)
        if (pagina > 50) break;
      } while (pageToken);

      cargado = true;
      const totalPiezas = Object.keys(indiceImagenes).length;
      sails.log.info(
        `MyCloud: índice cargado — ${totalPiezas} piezas con imágenes`,
      );
      return { totalPiezas };
    }

    if (accion === "buscar") {
      if (!cargado) return { ids: [], token: null };

      const match = (numeroRegistro || "").match(/(\d+)$/);
      sails.log.info("Buscando registro:", numeroRegistro);
      sails.log.info("Match:", match);
      sails.log.info(
        "Número extraído:",
        match ? String(parseInt(match[1], 10)) : "ninguno",
      );
      sails.log.info(
        "Claves en índice (muestra):",
        Object.keys(indiceImagenes).slice(0, 10),
      );

      if (!match) return { ids: [], token: null };
      const numero = String(parseInt(match[1], 10));
      const ids = indiceImagenes[numero] || [];
      return { ids, token: sails.config.mycloud.accessToken };
    }
  },
};

// Fetch simple sin dependencias externas
function fetchJson(url, token) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        });
      })
      .on("error", reject);
  });
}
