const fs = require('fs');

// Función para preparar el contenido a escribir
function transpilar(headers, sitios, niveles) {

    const nivelRebalse = [4, 3, 3, 5, 5, 4, 3, 5, 3.8, 4]   
    const complementoNivel = nivelRebalse.map(
        (nivel, index) => nivel - niveles[index]
    );

    fs.readFile('etl/plantilla.piolis', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let contenido = data
            .replace('<!-- HEADER_0 -->', headers[0])
            .replace('<!-- HEADER_1 -->', headers[1])
            .replace('<!-- HEADER_2 -->', headers[2])
            .replace('<!-- SITIO_0 -->', sitios[0])
            .replace('<!-- NIVEL_0 -->', niveles[0])
            .replace('<!-- SITIO_1 -->', sitios[1])
            .replace('<!-- NIVEL_1 -->', niveles[1])
            .replace('<!-- SITIO_2 -->', sitios[2])
            .replace('<!-- NIVEL_2 -->', niveles[2])
            .replace('<!-- SITIO_3 -->', sitios[3])
            .replace('<!-- NIVEL_3 -->', niveles[3])
            .replace('<!-- SITIO_4 -->', sitios[4])
            .replace('<!-- NIVEL_4 -->', niveles[4])
            .replace('<!-- SITIO_5 -->', sitios[5])
            .replace('<!-- NIVEL_5 -->', niveles[5])
            .replace('<!-- SITIO_6 -->', sitios[6])
            .replace('<!-- NIVEL_6 -->', niveles[6])
            .replace('<!-- SITIO_7 -->', sitios[7])
            .replace('<!-- NIVEL_7 -->', niveles[7])
            .replace('<!-- SITIO_8 -->', sitios[8])
            .replace('<!-- NIVEL_8 -->', niveles[8])
            .replace('<!-- SITIO_9 -->', sitios[9])
            .replace('<!-- NIVEL_9 -->', niveles[9])
            .replace('<!-- SITIOS -->', sitios.join("', '"))
            .replace('<!-- NIVELES -->', niveles.join("', '"))
            .replace('<!-- REBALSE -->', complementoNivel.join(', '));
        
        // Escribir en el archivo
        fs.writeFile("public/index.html", contenido, (err) => {
            if (err) {
                console.error('Error al escribir archivo:', err);
                return;
            }
            console.log('Archivo escrito correctamente.');
        });
    });
}

// Exportar la función si es necesario
module.exports = {
    transpilar
};


