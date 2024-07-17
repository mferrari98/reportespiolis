const fs = require('fs');
const cheerio = require('cheerio');

// Lee el archivo HTML
const archivoHTML = fs.readFileSync('../web/public/index.html', 'utf8');

// Carga el contenido en Cheerio
const $ = cheerio.load(archivoHTML);

// Selecciona el elemento con id 'contenido' y obtén su innerHTML
const contenidoHTML = $('#contenido').html();

console.log(contenidoHTML);
