const fs = require('fs');

// Función para preparar el contenido a escribir
function transpilar(reporte, estampatiempo, cb) {

    fs.readFile('./etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = data
            .replace('<!-- ESTAMPATIEMPO -->', formatoFecha(estampatiempo))
            .replace('<!-- HEADER_0 -->', reporte[0].variable.nivel.descriptor)
            .replace('<!-- HEADER_1 -->', reporte[0].variable.cloro.descriptor)
            .replace('<!-- HEADER_2 -->', "...")
            .replace('<!-- HEADER_3 -->', "...")
            .replace('<!-- SITIO_0 -->', reporte[0].sitio)
            .replace('<!-- NIVEL_0 -->', reporte[0].variable.nivel.valor)
            .replace('<!-- CLORO_0 -->', reporte[0].variable.cloro.valor)
            .replace('<!-- SITIO_1 -->', reporte[1].sitio)
            .replace('<!-- NIVEL_1 -->', reporte[1].variable.nivel.valor)
            .replace('<!-- CLORO_1 -->', reporte[1].variable.cloro.valor)
            .replace('<!-- SITIO_2 -->', reporte[2].sitio)
            .replace('<!-- NIVEL_2 -->', reporte[2].variable.nivel.valor)
            .replace('<!-- CLORO_2 -->', reporte[2].variable.cloro.valor)
            .replace('<!-- SITIO_3 -->', reporte[3].sitio)
            .replace('<!-- NIVEL_3 -->', reporte[3].variable.nivel.valor)
            .replace('<!-- CLORO_3 -->', reporte[3].variable.cloro.valor)
            .replace('<!-- SITIO_4 -->', reporte[4].sitio)
            .replace('<!-- NIVEL_4 -->', reporte[4].variable.nivel.valor)
            .replace('<!-- CLORO_4 -->', reporte[4].variable.cloro.valor)
            .replace('<!-- SITIO_5 -->', reporte[5].sitio)
            .replace('<!-- NIVEL_5 -->', reporte[5].variable.nivel.valor)
            .replace('<!-- CLORO_5 -->', reporte[5].variable.cloro.valor)
            .replace('<!-- SITIO_6 -->', reporte[6].sitio)
            .replace('<!-- NIVEL_6 -->', reporte[6].variable.nivel.valor)
            .replace('<!-- CLORO_6 -->', reporte[6].variable.cloro.valor)
            .replace('<!-- SITIO_7 -->', reporte[7].sitio)
            .replace('<!-- NIVEL_7 -->', reporte[7].variable.nivel.valor)
            .replace('<!-- CLORO_7 -->', reporte[7].variable.cloro.valor)
            .replace('<!-- SITIO_8 -->', reporte[8].sitio)
            .replace('<!-- NIVEL_8 -->', reporte[8].variable.nivel.valor)
            .replace('<!-- CLORO_8 -->', reporte[8].variable.cloro.valor)
            .replace('<!-- SITIO_9 -->', reporte[9].sitio)
            .replace('<!-- NIVEL_9 -->', reporte[9].variable.nivel.valor)
            .replace('<!-- CLORO_9 -->', reporte[9].variable.cloro.valor)

            .replace('<!-- SITIOS -->', reporte.map(objeto => "'" + objeto.sitio + "'"))
            .replace('<!-- NIVELES -->', reporte.map(objeto => (objeto.variable.nivel.valor != "s/d")? objeto.variable.nivel.valor : 0 ))
            
            .replace('<!-- COMPLEMENTO -->', reporte.map(objeto => (objeto.variable.nivel.valor != "s/d")? (objeto.rebalse - objeto.variable.nivel.valor).toFixed(3) : 0))
            .replace('<!-- REBALSE -->', reporte.map(objeto => objeto.rebalse.toFixed(3)));

        // Escribir en el archivo
        fs.writeFile("./web/public/index.html", contenido, (err) => {
            if (err) {
                console.error('Error al escribir archivo:', err);
                return;
            }
            console.log('TRANS - Archivo escrito correctamente.');
            cb()
        });
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


