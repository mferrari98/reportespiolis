const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const ID_MOD = "Render"

function RenderHTML() { }

RenderHTML.prototype.renderizar = function () {
    
    const archivoHTML = fs.readFileSync('./web/public/index.html', 'utf8');
    extraerTabla(archivoHTML)
    ejecutarPlotImagen()
}

function extraerTabla(archivoHTML) {
    const $ = cheerio.load(archivoHTML);

    const headContent = $('head').children().not('script').toString();
    const bodyContent = $('body').children().not('script, #myDiv, #guardar').toString();

    // armar un nuevo html
    const newHtml = `
    <!DOCTYPE html>
    <html lang="es">
        <head>
            ${headContent}
        </head>

        <body>
            ${bodyContent}
        </body>
    </html>
    `;

    fs.writeFileSync('./reporte/salida/tabla.html', newHtml, 'utf8');
}

async function ejecutarPlotImagen() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/web/public/index.html`);
   
    // Captura la imagen del div con id "myDiv"
    const element = await page.$('#myDiv');
    await element.screenshot({ path: './reporte/salida/grafico.png' });

    await browser.close();
}

module.exports = RenderHTML;

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);