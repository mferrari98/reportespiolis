const fs = require('fs');
const nodemailer = require('nodemailer');

const ID_MOD = "Email"

/*
Configuración del transporte SMTP
es importante entender que SMTP se usa para enviar mensajes unicamente, es decir no se usa
para recibir mensajes.
por otro lado, en caso de enviar mensajes debe utilizarse POP3 (mas viejo) o IMAP.
*/
let transporter = nodemailer.createTransport({
    host: 'post.servicoop.com',
    port: 25,
    auth: {
        user: 'hdonato@servicoop.com',
        pass: 'donato'
    },
    tls: {
        rejectUnauthorized: false       // omitir verificacion en cadena
    }
});


function EnviarEmail() { }

EnviarEmail.prototype.enviar = function () {
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
}


module.exports = EnviarEmail;

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);