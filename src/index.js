const { closeDatabase } = require('./basedatos/db');
/*
observar cambios en el archivo de referencia
*/
const { iniciar, parar } = require('./etl/observador')
/*
desplegar servidor web el reporte generado
*/
const { closeServer } = require("./web/server")
/*
armar esquema de base de datos
*/
const { crearTablas } = require('./basedatos/crear_tablas');

crearTablas((err) => {
    if (err) {
        console.error('Error al crear el esquema de tablas:', err.message);
    } else {
        iniciar()
    }
});

process.on('SIGINT', () => {
    parar()
    closeServer(() => {
        closeDatabase(() => {
            process.exit(0);
        })
    })
});