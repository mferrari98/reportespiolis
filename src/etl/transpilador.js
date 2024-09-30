const { verLog } = require("../../config.json")

const fs = require('fs');
const cheerio = require('cheerio');
const { sindet } = require("./etl");

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

/* ===========================================================
===================== FUNCIONES INTERNAS =====================
==============================================================
*/

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
            .replace(`NIVEL_${i}`, item.variable.nivel.valor === undefined ? '-' : item.variable.nivel.valor)
            .replace(`CLORO_${i}`, item.variable.cloro.valor === undefined ? '-' : item.variable.cloro.valor)
            .replace(`TURB_${i}`, item.variable.turbiedad.valor === undefined ? '-' : item.variable.turbiedad.valor)
            .replace(`VOLDIA_${i}`, item.variable.voldia.valor === undefined ? '-' : item.variable.voldia.valor);
    })

    contenido = contenido
        .replaceAll('<!-- SITIOS -->', reporte.map(objeto => "'" + objeto.sitio + "'"))
        .replaceAll('<!-- NIVELES -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? objeto.variable.nivel.valor : 0))
        .replaceAll('<!-- NIVELESTOTAL -->', parseFloat(reporte.reduce((total, objeto) => total + (objeto.variable.nivel.valor != sindet ? objeto.variable.nivel.valor : 0), 0).toFixed(3)))


        .replaceAll('<!-- COMPLEMENTO -->', reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? (objeto.variable.nivel.rebalse - objeto.variable.nivel.valor).toFixed(3) : 0))
        .replaceAll('<!-- COMPLEMENTOTOTAL -->', reporte.reduce((total, objeto) => total + ((objeto.variable.nivel.valor != sindet) ? parseFloat((objeto.variable.nivel.rebalse - objeto.variable.nivel.valor).toFixed(3)) : 0), 0).toFixed(3))
        .replaceAll('<!-- REBALSE -->', reporte.map(objeto => objeto.variable.nivel.rebalse.toFixed(3)));

    return contenido
}

function prepararGrafLineas(reporte, contenido) {

    let traces = []
    const marca = '[trace]';
    const posicionMarca = contenido.indexOf(marca);
    
    // Elimina la marca del texto.
    let textoModificado = contenido.replace(marca, '');

    // Itera sobre el arreglo `reporte` e inserta la nueva estructura en la posición memorizada.
    let resultadoFinal = textoModificado.substring(0, posicionMarca); // Texto antes de la marca.

    reporte.forEach((elem, indice) => {

        traces[indice] = `trace${indice}`

        let estructura = `
        var ${traces[indice]} = {
            name: "${elem.sitio}",
            x: [${unpack(elem.variable.nivel.historico, 'etiempo')}],
            y: [${unpack(elem.variable.nivel.historico, 'valor')}],
            type: 'scatter'
        };\n`;

        // Inserta la estructura en la posición original de la marca.
        resultadoFinal += estructura;
    });

    resultadoFinal += `\nvar datosLinea = [${traces.join(", ")}];`
    // Agrega el contenido restante del texto original después de la marca.
    resultadoFinal += textoModificado.substring(posicionMarca);

    return resultadoFinal;
}

function unpack(rows, key) {
    return rows.map(function (row) {
        return `"${row[key]}"`
    });
}

function crearHTMLSalida(contenido, cb) {
    // Escribir en el archivo
    fs.writeFile("./web/public/reporte.html", contenido, (err) => {
        if (err) {
            console.error('Error al escribir archivo:', err);
            return;
        }
        if (verLog)
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