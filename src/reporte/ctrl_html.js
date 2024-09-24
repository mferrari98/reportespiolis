const { verLog } = require("../../config.json")

const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const EnviarEmail = require('./ctrl_email');

const ID_MOD = "CtrlHTML"

const enviarEmail = new EnviarEmail();

function RenderHTML() { }

RenderHTML.prototype.renderizar = function () {

    extraerTabla()
    plotBarras(() => {
        plotLineas(() => {
            enviarEmail.enviar()
        })
    })
}

function extraerTabla() {

    const archivoHTML = fs.readFileSync('./web/public/index.html', 'utf8');
    const $ = cheerio.load(archivoHTML);
    
    const headContent = $('head').children().not('script').toString();
    const bodyContent = $('body').children().not('script, #grafBarras, #grafLineas, #guardar').toString();

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

async function plotBarras(cb) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/web/public/index.html`);
   
    // Captura la imagen del div con id "myDiv"
    const element = await page.$('#grafBarras');
    await element.screenshot({ path: './reporte/salida/grafBarras.png' });

    await browser.close();
    cb()
}

async function plotLineas(cb) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/web/public/index.html`);
   
    // Captura la imagen del div con id "myDiv"
    const element = await page.$('#grafLineas');
    await element.screenshot({ path: './reporte/salida/grafLineas.png' });

    await browser.close();
    cb()
}

module.exports = RenderHTML;

if (verLog) {
    console.log(`${ID_MOD} - Directorio trabajo:`, process.cwd());
    console.log(`${ID_MOD} - Directorio del archivo:`, __dirname);
}