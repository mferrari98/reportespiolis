const fs = require('fs');
const cheerio = require('cheerio');

const ID_MOD = "Render"

function RenderHTML() { }

RenderHTML.prototype.renderizar = function () {
    // Lee el archivo HTML
    const archivoHTML = fs.readFileSync('./web/public/index.html', 'utf8');
    // Carga el contenido en Cheerio
    const $ = cheerio.load(archivoHTML);
    // Selecciona el elemento con id 'contenido' y obtén su innerHTML
    const contenidoHTML = $('#contenido').html();

    console.log(contenidoHTML);    
}

module.exports = RenderHTML;

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);