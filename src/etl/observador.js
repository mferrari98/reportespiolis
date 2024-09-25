const fs = require("fs");
const readline = require("readline");

const { verLog } = require("../../config.json")
const { lanzarETL } = require("./etl");
const { lanzarReporte } = require("../reporte/reporte")

const ID_MOD = "OBSERV";

let filePath = process.argv[2];
let currentModifiedTime;
let lastModifiedTime = null;
const checkInterval = 4 * 1000; // tiempo verificacion de cambios en milisegundos

function iniciar() {
  // Verifica que se haya proporcionado el archivo como argumento
  if (process.argv.length < 3) {
    console.error(
      `${ID_MOD} - No hay direccion en linea de comandos, se utilizara definicion de config.json`
    );

    fs.readFile("../config.json", "utf8", (err, jsonString) => {
      // Parsea el contenido del archivo JSON a un objeto JavaScript
      const data = JSON.parse(jsonString);
      filePath = data.direcc_remota + "/reporte_horario_test.log";
      checkFileModification();
    });
  }
}

function verUltimoCambio(evSCADA, cb) {
  lanzarReporte(evSCADA, currentModifiedTime, () => { cb() })
}

function parar() {
  clearInterval(intervalId);

  if (verLog)
    console.log(`${ID_MOD} - deteniendo observador`);
}

/* ===========================================================
===================== FUNCIONES INTERNAS =====================
==============================================================
*/

// Función para leer y procesar el archivo
function readAndProcessFile() {
  let lines = [];
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false,
    });

    // Escucha cada línea del archivo
    rl.on("line", (line) => {
      lines.push(line);
    });

    rl.on("close", () => {
      lanzarETL(lines, () => {
        verUltimoCambio(true, () => { } )
      })
    });

  } catch (error) {
    console.error(`Error al leer el archivo: ${error.message}`);
  }
}

// Función para verificar la fecha de modificación del archivo
function checkFileModification() {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(`Error al acceder al archivo: ${err.message}`);
      return;
    }

    currentModifiedTime = stats.mtime;

    if (!lastModifiedTime || currentModifiedTime > lastModifiedTime) {
      const fechaActual = formatoFecha(currentModifiedTime);
      const fechaAnterior = formatoFecha(lastModifiedTime);
      lastModifiedTime = currentModifiedTime;

      if (verLog)
        console.log(`Actual ${fechaActual} ==> Anterior ${fechaAnterior}`);

      readAndProcessFile();
    } else {
      if (verLog)
        console.log(`${ID_MOD} - El archivo no ha sido modificado desde la última lectura`);
    }
  });
}

// Función para formatear la fecha
function formatoFecha(fechaOriginal) {
  const fecha = new Date(fechaOriginal);

  // Obtiene los componentes de la fecha
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  const seconds = String(fecha.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const intervalId = setInterval(checkFileModification, checkInterval);

module.exports = { iniciar, verUltimoCambio, parar };

if (verLog) {
  console.log(`${ID_MOD} - Directorio trabajo:`, process.cwd());
  console.log(`${ID_MOD} - Directorio del archivo:`, __dirname);
}
