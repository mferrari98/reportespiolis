const fs = require('fs');
const { sindet } = require("./parser-reporte")

const ID_MOD = "TRANS";

function transpilar(reporte, estampatiempo, cb) {

    fs.readFile('./etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = expandirPlantilla(data)
        sustituirMarcas(reporte, estampatiempo, contenido, () => {
            cb()
        })
    });
}

function expandirPlantilla(data) { return data }

function sustituirMarcas(reporte, estampatiempo, contenido, cb) {
    
    contenido = contenido
        .replaceAll('<!-- ESTAMPATIEMPO -->', formatoFecha(estampatiempo))
        .replaceAll('<!-- HEADER_0 -->', reporte[0].variable.nivel.descriptor)
        .replaceAll('<!-- HEADER_1 -->', reporte[0].variable.cloro.descriptor)
        .replaceAll('<!-- HEADER_2 -->', reporte[0].variable.turbiedad.descriptor)
        .replaceAll('<!-- HEADER_3 -->', "...")

    reporte.forEach((item, i) => {
        contenido = contenido
            .replace(`<!-- SITIO_${i} -->`, item.sitio)
            .replace(`<!-- NIVEL_${i} -->`, item.variable.nivel.valor === sindet ? '' : item.variable.nivel.valor)
            .replace(`<!-- CLORO_${i} -->`, item.variable.cloro.valor === sindet ? '' : item.variable.cloro.valor)
            .replace(`<!-- TURB_${i} -->`, item.variable.turbiedad.valor === sindet ? '' : item.variable.turbiedad.valor);
    })

    contenido = contenido
        .replaceAll('<!-- SITIOS -->', reporte.map(objeto => "'" + objeto.sitio + "'"))
        .replaceAll('<!-- NIVELES -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? objeto.variable.nivel.valor : 0))

        .replaceAll('<!-- COMPLEMENTO -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? (objeto.rebalse - objeto.variable.nivel.valor).toFixed(3) : 0))
        .replaceAll('<!-- REBALSE -->', reporte.map(objeto => objeto.rebalse.toFixed(3)));

    // Escribir en el archivo
    fs.writeFile("./web/public/index.html", contenido, (err) => {
        if (err) {
            console.error('Error al escribir archivo:', err);
            return;
        }
        console.log(`${ID_MOD} - Archivo escrito correctamente`);
        cb()
    });
}

function formatoFecha(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    // Obtiene los componentes de la fecha
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} a las ${hours}:${minutes}`;
}

// Exportar la función si es necesario
module.exports = {
    transpilar
};


