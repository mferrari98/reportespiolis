
const fs = require('fs');
const readline = require('readline');
const { getHeaders, getFirstWords } = require('./parser-reporte');

// Verifica que se haya proporcionado el archivo como argumento
if (process.argv.length < 3) {
    console.error('Por favor, proporciona la ubicación del archivo de texto como argumento.');
    process.exit(1);
}

const filePath = process.argv[2];
const lines = [];

try {
    // Crea una interfaz de lectura de línea
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
        console.log(`Primeras palabras de cada fila: ${firstWords.join(', ')}`);
    });
} catch (error) {
    console.error(`Error al leer el archivo: ${error.message}`);
}