const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const ID_MOD = "Render"

/*
==================================================
============ pasar a un modulo aparte ============
==================================================
 */
// Configuración del transporte SMTP
let transporter = nodemailer.createTransport({
    host: 'post.servicoop.com',     // Cambia esto por el servidor SMTP que estés usando
    port: 25,                       // Usualmente 587 o 465 para SSL    
    auth: {
        user: 'hdonato@servicoop.com',  // Cambia esto por tu correo electrónico
        pass: 'donato'                  // Cambia esto por tu contraseña
    },
    tls: {
        rejectUnauthorized: false       // omitir verificacion en cadena
    }
});
/*
==================================================
============ pasar a un modulo aparte ============
==================================================
 */

function RenderHTML() { }

RenderHTML.prototype.renderizar = function () {
    
    const archivoHTML = fs.readFileSync('./web/public/index.html', 'utf8');
    extraerTabla(archivoHTML)
    ejecutarPlotImagen(() => {

        // Enviar el correo
        let resumen = "generacion automatica de reportes mejorada"
        let htmlContent = fs.readFileSync('./reporte/salida/tabla.html', 'utf8');

        let mailOptions = {
            from: "'soyhugo' <hdonato@servicoop.com>",
            to: 'hdonato@servicoop.com',
            subject: 'reportespiolis',
            text: resumen,
            html: `
            ${resumen}
            ${htmlContent}
            <img src="cid:graficobarras"/>
            `,
            attachments: [                
                {
                    filename: 'imagen.jpg',
                    path: './reporte/salida/grafico.png', // Ruta de la imagen
                    cid: 'graficobarras' // CID para referenciar la imagen en el cuerpo del mensaje
                }
            ]
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);            
        });
    })
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

async function ejecutarPlotImagen(cb) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/web/public/index.html`);
   
    // Captura la imagen del div con id "myDiv"
    const element = await page.$('#myDiv');
    await element.screenshot({ path: './reporte/salida/grafico.png' });

    await browser.close();
    cb()
}

module.exports = RenderHTML;

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);