const fs = require('fs');
const cheerio = require('cheerio');

const { sindet } = require("./parser-reporte")

const ID_MOD = "TRANS";

function transpilar(reporte, estampatiempo, cb) {

    fs.readFile('./etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = expandirPlantilla(reporte, data)        
        contenido = sustituirMarcas(reporte, estampatiempo, contenido)
        contenido = prepararGrafLineas(reporte, contenido)
        
        // solo para debug
        fs.writeFile("./etl/plantilla.expand.html", contenido, () => { })

        crearHTMLSalida(contenido, () => { cb() })
    });
}

function expandirPlantilla(reporte, data) {
    const $ = cheerio.load(data);

    // Seleccionar solo los <tr> dentro del <tbody>
    const tbody = $('tbody'); // Selecciona el <tbody>
    const filaPlantilla = tbody.find('tr').first();

    reporte.forEach((item, i) => {
        const fila = filaPlantilla.clone(); // Clonar la fila de la plantilla
        fila.find('td').eq(0).text(`SITIO_${i}`);
        fila.find('td').eq(1).text(`NIVEL_${i}`);
        fila.find('td').eq(2).text(`CLORO_${i}`);
        fila.find('td').eq(3).text(`TURB_${i}`);
        fila.find('td').eq(4).text(`VOLDIA_${i}`);
        tbody.append(fila); // Agregar la fila al <tbody>
    });

    filaPlantilla.remove();
    return $.html();    
}

function sustituirMarcas(reporte, estampatiempo, contenido, cb) {
    
    contenido = contenido
        .replaceAll('<!-- ESTAMPATIEMPO -->', formatoFecha(estampatiempo))
        .replaceAll('<!-- HEADER_0 -->', reporte[0].variable.nivel.descriptor)
        .replaceAll('<!-- HEADER_1 -->', reporte[0].variable.cloro.descriptor)
        .replaceAll('<!-- HEADER_2 -->', reporte[0].variable.turbiedad.descriptor)
        .replaceAll('<!-- HEADER_3 -->', reporte[0].variable.voldia.descriptor)

    reporte.forEach((item, i) => {
        contenido = contenido
            .replace(`SITIO_${i}`, item.sitio)
            .replace(`NIVEL_${i}`, item.variable.nivel.valor === sindet ? '' : item.variable.nivel.valor)
            .replace(`CLORO_${i}`, item.variable.cloro.valor === sindet ? '' : item.variable.cloro.valor)
            .replace(`TURB_${i}`, item.variable.turbiedad.valor === sindet ? '' : item.variable.turbiedad.valor)
            .replace(`VOLDIA_${i}`, item.variable.turbiedad.valor === sindet ? '' : item.variable.turbiedad.valor);
    })

    contenido = contenido
        .replaceAll('<!-- SITIOS -->', reporte.map(objeto => "'" + objeto.sitio + "'"))
        .replaceAll('<!-- NIVELES -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? objeto.variable.nivel.valor : 0))

        .replaceAll('<!-- COMPLEMENTO -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? (objeto.rebalse - objeto.variable.nivel.valor).toFixed(3) : 0))
        .replaceAll('<!-- REBALSE -->', reporte.map(objeto => objeto.rebalse.toFixed(3)));

    return contenido
}

function prepararGrafLineas(reporte, contenido) {
    const regex = /\[trace3\](\w+):/g;

    // Reemplazar cada marcador y agregar una coma al final
    const resultado = contenido.replace(regex, (match, p1) => {
        let nuevoTexto = '';

        switch (p1) {
            case 'name':
                nuevoTexto = "[" + reporte.map(item => `"${item.sitio}"`).join(', ') + "]"; // Reemplazo para 'name'                
                break;
            case 'x':
                nuevoTexto = "[" + reporte.map((_, index) => index).join(', ') + "]"; // lista random de niveles con semilla fija
                break;
            case 'y':
                nuevoTexto = "[" + reporte.map(_ => `"${(5.0 * Math.random()).toFixed(3)}"`).join(', ') + "]"; // lista random de niveles con semilla fija
                break;
            default:
                nuevoTexto = `"Valor por defecto"`; // Reemplazo por defecto si 'p1' no coincide con ningún caso
        }

        return `${p1}: ${nuevoTexto}`;
    });
    return resultado
}

function crearHTMLSalida(contenido, cb) {
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