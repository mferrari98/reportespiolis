const fs = require('fs');
const nodemailer = require('nodemailer');
const msg = require('../../config.json');

const ID_MOD = "Email"

let transporter
let destinos = msg.email.difusion
let user = msg.email.user
let pass = msg.email.pass

/*
Configuración del transporte SMTP
es importante entender que SMTP se usa para enviar mensajes unicamente, es decir no se usa
para recibir mensajes.
por otro lado, en caso de enviar mensajes debe utilizarse POP3 (mas viejo) o IMAP.
*/
transporter = nodemailer.createTransport({
    host: 'post.servicoop.com',
    port: 25,
    auth: {
        user: user,
        pass: pass
    },
    tls: {
        rejectUnauthorized: false       // omitir verificacion en cadena
    }
});

function EnviarEmail() { }

EnviarEmail.prototype.enviar = function () {

    const { date, time } = getCurrentDateTime();

    // Enviar el correo
    let resumen = "Generacion automatica de reportes mejorada"
    let htmlContent = fs.readFileSync('./reporte/salida/tabla.html', 'utf8');
    
    let mailOptions = {
        from: "<desarrollo.comunicaciones@servicoop.com>",
        to: destinos,
        subject: `Reporte de agua potable ${date} ${time}`,
        text: resumen,
        html: `
            ${resumen}
            ${htmlContent}
            <div style="text-align: center;">
                <img src="cid:grafBarras" alt="Grafico de Barras"/>
                <img src="cid:grafLineas" alt="Grafico de Lineas"/>
            </div>
            `,
        attachments: [            
            {
                filename: 'imagen.jpg',
                path: './reporte/salida/grafBarras.png', // Ruta de la imagen
                cid: 'grafBarras' // CID para referenciar la imagen en el cuerpo del mensaje
            },
            {
                filename: 'imagen2.jpg',
                path: './reporte/salida/grafLineas.png', // Ruta de la imagen
                cid: 'grafLineas' // CID para referenciar la imagen en el cuerpo del mensaje
            }
        ]
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });   
}

function getCurrentDateTime() {
    const now = new Date();
    const options = {
        year: '2-digit', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    const formatter = new Intl.DateTimeFormat('es-ES', options);
    const parts = formatter.formatToParts(now);
    const date = `${parts[4].value}/${parts[2].value}/${parts[0].value}`; // dd/mm/yy
    const time = `${parts[6].value}:${parts[8].value}:${parts[10].value}`; // hh:mm:ss
    return { date, time };
}

module.exports = EnviarEmail;

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);