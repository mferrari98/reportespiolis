const fs = require('fs');
const readline = require('readline');

const { getTipoVariable, getSitiosNombre, getSitiosNiveles } = require('./parser-reporte');
const { transpilar } = require('./transpilador');

let filePath = process.argv[2];
let lines = [];

let lastModifiedTime = null;
const checkInterval = 4 * 1000; // tiempo verificacion de cambios

// Verifica que se haya proporcionado el archivo como argumento
if (process.argv.length < 3) {
    console.error('ETL - Parece que la ubicacion del achivo no llega como argumento de la linea de comandos');
    console.error("ETL - Se utilizara la direccion definida en config.json");

    fs.readFile('./etl/config.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }
        try {
            // Parsea el contenido del archivo JSON a un objeto JavaScript
            const data = JSON.parse(jsonString);
            filePath = data.direcc_remota + "/reporte_horario_test.log";
            checkFileModification()
        } catch (err) {
            console.error('Error al parsear JSON:', err);
        }
    });
}

// Función para leer y procesar el archivo
function readAndProcessFile() {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        // Escucha cada línea del archivo
        rl.on('line', (line) => {
            lines.push(line);
        });

        rl.on('close', () => {
            const headers = getTipoVariable(lines[0]);

            lines.splice(0, 1)
            const sitios = getSitiosNombre(lines);
            const niveles = getSitiosNiveles(lines, 0); // Obtiene los datos de la segunda columna (índice 0)

            transpilar(headers, sitios, niveles);
            lines = [];
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

        const currentModifiedTime = stats.mtime;

        if (!lastModifiedTime || currentModifiedTime > lastModifiedTime) {
            const fechaActual = formatoFecha(currentModifiedTime);
            const fechaAnterior = formatoFecha(lastModifiedTime);
            lastModifiedTime = currentModifiedTime;

            console.log(`Actual ${fechaActual} ==> Anterior ${fechaAnterior}`);
            readAndProcessFile();
        } else {
            console.log('El archivo no ha sido modificado desde la última lectura.');
        }
    });
}

// Función para formatear la fecha
function formatoFecha(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    // Obtiene los componentes de la fecha
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const intervalId = setInterval(checkFileModification, checkInterval);

function pararETL() {
    clearInterval(intervalId);
    console.log('ETL - deteniendo observador');
}

module.exports = { pararETL };