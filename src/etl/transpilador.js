const fs = require('fs');

// Función para preparar el contenido a escribir
function transpilar(reporte) {

    fs.readFile('etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = data
            .replace('<!-- HEADER_0 -->', reporte[0].tipo_id)
            .replace('<!-- HEADER_1 -->', "...")
            .replace('<!-- HEADER_2 -->', "...")
            .replace('<!-- HEADER_3 -->', "...")
            .replace('<!-- SITIO_0 -->', reporte[0].sitio_id)
            .replace('<!-- NIVEL_0 -->', reporte[0].valor)
            .replace('<!-- SITIO_1 -->', reporte[1].sitio_id)
            .replace('<!-- NIVEL_1 -->', reporte[1].valor)
            .replace('<!-- SITIO_2 -->', reporte[2].sitio_id)
            .replace('<!-- NIVEL_2 -->', reporte[2].valor)
            .replace('<!-- SITIO_3 -->', reporte[3].sitio_id)
            .replace('<!-- NIVEL_3 -->', reporte[3].valor)
            .replace('<!-- SITIO_4 -->', reporte[4].sitio_id)
            .replace('<!-- NIVEL_4 -->', reporte[4].valor)
            .replace('<!-- SITIO_5 -->', reporte[5].sitio_id)
            .replace('<!-- NIVEL_5 -->', reporte[5].valor)
            .replace('<!-- SITIO_6 -->', reporte[6].sitio_id)
            .replace('<!-- NIVEL_6 -->', reporte[6].valor)
            .replace('<!-- SITIO_7 -->', reporte[7].sitio_id)
            .replace('<!-- NIVEL_7 -->', reporte[7].valor)
            .replace('<!-- SITIO_8 -->', reporte[8].sitio_id)
            .replace('<!-- NIVEL_8 -->', reporte[8].valor)
            .replace('<!-- SITIO_9 -->', reporte[9].sitio_id)
            .replace('<!-- NIVEL_9 -->', reporte[9].valor)

            .replace('<!-- SITIOS -->', reporte.map(objeto => "'" + objeto["sitio_id"].toString() + "'"))
            .replace('<!-- NIVELES -->', reporte.map(objeto => objeto["valor"]))

            .replace('<!-- REBALSE -->', reporte.map(objeto => (objeto["rebalse"] - objeto["valor"]).toFixed(3)));

        // Escribir en el archivo
        fs.writeFile("web/public/index.html", contenido, (err) => {
            if (err) {
                console.error('Error al escribir archivo:', err);
                return;
            }
            console.log('TRANS - Archivo escrito correctamente.');
        });
    });
}

// Exportar la función si es necesario
module.exports = {
    transpilar
};


