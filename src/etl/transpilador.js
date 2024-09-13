const { verLog } = require("../../config.json")

const fs = require('fs');
const cheerio = require('cheerio');
const { sindet } = require("./parser-reporte");

const ID_MOD = "TRANS";

let sitios, niveles, rebalse, complemento

function transpilar(reporte, estampatiempo, cb) {

    sitios = reporte.map(objeto => "'" + objeto.sitio + "'")
    niveles = reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? objeto.variable.nivel.valor : 0)
    rebalse = reporte.map(objeto => objeto.variable.nivel.rebalse.toFixed(3))
    complemento = reporte.map(objeto => (objeto.variable.nivel.valor != sindet) ? (objeto.variable.nivel.rebalse - objeto.variable.nivel.valor).toFixed(3) : 0)

   // console.log(reporte[9].historico)

    fs.readFile('./etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = expandirPlantilla(reporte, data)        
        contenido = sustituirMarcas(reporte, estampatiempo, contenido)        
        contenido = prepararGraficaBarras(reporte, contenido)
        contenido = prepararGraficaTemporal(reporte, contenido)
        
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
            .replace(`VOLDIA_${i}`, item.variable.voldia.valor === sindet ? '' : item.variable.voldia.valor);
    })

    contenido = contenido
        .replaceAll('<!-- SITIOS -->', sitios)
        .replaceAll('<!-- NIVELES -->', niveles)

        .replaceAll('<!-- COMPLEMENTO -->', complemento)
        .replaceAll('<!-- REBALSE -->', rebalse);

    return contenido
}

function prepararGraficaBarras(reporte, contenido) {
    const marca = '[grafico_barras]';
    const posicionMarca = contenido.indexOf(marca);
    
    // Elimina la marca del texto.
    let textoModificado = contenido.replace(marca, '');

   

    let scriptGrafico = `
    /* ********************************************
     *********** GRAFICO BARRAS APILADAS ***********
     ******************************************** */
    

    var trace10 = {
        x: [${sitios}],
        y: [${niveles}],
        name: 'Nivel',
        type: 'bar',
        marker: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-nivel').trim(),
        },
        text: [${niveles}],
        textposition: 'auto',
        hoverinfo: 'none',
    };

    var trace11 = {
        x: [${sitios}],
        y: [${complemento}],
        name: 'Rebalse',
        type: 'bar',
        marker: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-rebalse').trim(),
            opacity: 0.2
        },
        text: [${rebalse}],
        textposition: 'auto',
        hoverinfo: 'none',
    };

    var datosBarra = [trace10, trace11];

    // Configurar el diseño del gráfico
    var layout = {
        barmode: 'stack',
        xaxis: {
            title: 'Sitio'
        },
        yaxis: {
            title: 'Nivel [m]'
        },
        dragmode: false,
        zoom: false,
        autosize: true,
        font: {
            family: 'consolas',
            size: 14
        }
    };
    var configBarras = { responsive: true, displayModeBar: false };

    Plotly.newPlot('grafBarras', datosBarra, layout, configBarras);
    `;

    // Inserta el código en la posición original de la marca.
    let resultadoFinal = textoModificado.substring(0, posicionMarca); // Texto antes de la marca.
    resultadoFinal += scriptGrafico; // Inserta el script generado
    resultadoFinal += textoModificado.substring(posicionMarca); // Texto después de la marca.

    return resultadoFinal;
}


function prepararGraficaTemporal(reporte, contenido) {
    const marca = '[grafico_tiempo]';
    const posicionMarca = contenido.indexOf(marca);
    
    // Elimina la marca del texto.
    let textoModificado = contenido.replace(marca, '');

    let traces = [];
    let scriptGrafico = '';

    // Itera sobre el arreglo `reporte` para crear una traza por cada sitio
    reporte.forEach((elem, indice) => {
        let fechas = elem.historico.map(item => `"${formatoFecha2(item.etiempo)}"`).join(', ');
        let valores = elem.historico.map(item => item.valor).join(', ');

        primeraFecha = formatoFecha2(elem.historico[0].etiempo);
        ultimaFecha = formatoFecha2(elem.historico[elem.historico.length - 1].etiempo);
        
        let trace = `
        var trace${indice} = {
            type: "scatter",
            mode: "lines",
            name: '${elem.sitio}',
            x: [${fechas}],
            y: [${valores}],
            line: { color: '${getCustomDarkColor()}' }
        };`;

        traces.push(`trace${indice}`);
        scriptGrafico += trace;
    });

    scriptGrafico += `
    /* ********************************************
     *********** GRAFICO LINEA DE TIEMPO ***********
     ******************************************** */
    var data = [${traces.join(', ')}];

  var layout = {
    title: 'Niveles por Reserva',
    xaxis: {
        title: '',
        
        //tickvals: uniqueDates,   // Opcional: puedes definir las fechas únicas que deseas mostrar
    },
    yaxis: {
        title: 'Niveles'
    },
    showlegend: true,
    
};

    Plotly.newPlot('grafLineaTiempo', data, layout);
    `;

    // Inserta el código en la posición original de la marca.
    let resultadoFinal = textoModificado.substring(0, posicionMarca); // Texto antes de la marca.
    resultadoFinal += scriptGrafico; // Inserta el script dentro de la marca
    resultadoFinal += textoModificado.substring(posicionMarca); // Texto después de la marca.

    return resultadoFinal;
}

let colorIndex = 0;

function getCustomDarkColor() {
    const customDarkColors = [
        '#17BECF', // Teal/Aqua
        '#FF8C00', // Dark Orange
        '#FF4500', // Orange Red
        '#FF6347', // Tomato
        '#FFD700', // Gold
        '#20B2AA', // Light Sea Green
        '#8A2BE2', // Blue Violet
        '#FF1493', // Deep Pink
        '#00CED1', // Dark Turquoise
        '#DC143C', // Crimson
        '#CD5C5C', // Indian Red
        '#F08080', // Light Coral
        '#C06060'  // Muted Crimson
    ];
    
    // Obtener el color de la secuencia
    const color = customDarkColors[colorIndex % customDarkColors.length];
    
    // Incrementar el índice para la próxima llamada
    colorIndex++;
    
    return color;
}



function crearHTMLSalida(contenido, cb) {
    // Escribir en el archivo
    fs.writeFile("./web/public/index.html", contenido, (err) => {
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

function formatoFecha2(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    // Obtiene los componentes de la fecha
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
}


// Exportar la función si es necesario
module.exports = {
    transpilar
};