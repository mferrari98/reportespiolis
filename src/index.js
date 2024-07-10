const { openDatabase, closeDatabase } = require('./basedatos/db');
openDatabase();

/*
armar esquema de base de datos
*/
require('./basedatos/crear_tablas');

/*
observar cambios en el archivo de referencia
*/
const { pararETL } = require('./etl/etl')

/*
desplegar servidor web el reporte generado
*/
const { closeServer } = require("./web/server")

process.on('SIGINT', () => {
    pararETL()
    closeServer(() => {
        closeDatabase(() => {
            process.exit(0);
        })
    })
});