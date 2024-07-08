const { openDatabase, closeDatabase } = require('./persistencia/db');
openDatabase();

/*
armar esquema de base de datos
*/
require('./persistencia/crear_tablas');

/*
observar cambios en el archivo de referencia
*/
const { pararETL } = require('./etl/etl')

/*
desplegar servidor web el reporte generado
*/
const { closeServer } = require("./web/web-server")

process.on('SIGINT', () => {
    pararETL()
    closeServer(() => {
        closeDatabase(() => {
            process.exit(0);
        })
    })
});