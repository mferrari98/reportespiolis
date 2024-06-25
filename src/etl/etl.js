const fs = require('fs');
const readline = require('readline');
const { getHeaders, getFirstWords } = require('./parser-reporte');

const filePath = process.argv[2];
const lines = [];
let lastModifiedTime = null;

const checkInterval = 4 * 1000; // Verificar cada 60 segundos

// Verifica que se haya proporcionado el archivo como argumento
if (process.argv.length < 3) {
    console.error('Por favor, proporciona la ubicación del archivo de texto como argumento.');
    process.exit(1);
}

// Función para leer y procesar el archivo
function readAndProcessFile() {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        let isFirstLine = true;
        let headers = [];
        let firstWords = [];

        // Escucha cada línea del archivo
        rl.on('line', (line) => {
            if (isFirstLine) {
                headers = getHeaders(line);
                isFirstLine = false;
            } else {
                lines.push(line);
            }
        });

        // Cuando termina de leer el archivo, muestra los resultados
        rl.on('close', () => {
            firstWords = getFirstWords(lines);
            console.log(`Encabezados: ${headers.join(', ')}`);
            console.log(`Primera palabra por fila: ${firstWords.join(', ')}`);
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
            lastModifiedTime = currentModifiedTime;
            console.log(`El archivo fue modificado el: ${currentModifiedTime}`);
            readAndProcessFile();
        } else {
            console.log('El archivo no ha sido modificado desde la última lectura.');
        }
    });
}

// Verificación inicial
checkFileModification();

// Verificación periódica del archivo
setInterval(checkFileModification, checkInterval);