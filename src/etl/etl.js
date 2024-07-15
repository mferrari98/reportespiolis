const fs = require('fs');
const readline = require('readline');

const { getTipoVariable, getSitiosNombre, getNiveles } = require('./parser-reporte');
const { transpilar } = require('./transpilador');

const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');
const HistoricoLecturaDAO = require('../dao/historicoLecturaDAO');

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();

const ID_MOD = "ETL"

let filePath = process.argv[2];

let lastModifiedTime = null;
const checkInterval = 4 * 1000; // tiempo verificacion de cambios

function iniciar() {
    // Verifica que se haya proporcionado el archivo como argumento
    if (process.argv.length < 3) {
        console.error(`${ID_MOD} - Parece que la ubicacion del achivo no llega como argumento de la linea de comandos`);
        console.error(`${ID_MOD} - Se utilizara la direccion definida en config.json`);

        fs.readFile('./etl/config.json', 'utf8', (err, jsonString) => {
            if (err) {
                console.error('Error al leer el archivo:', err);
                return;
            }
            try {
                // Parsea el contenido del archivo JSON a un objeto JavaScript
                const data = JSON.parse(jsonString);
                filePath = data.direcc_remota + "/reporte_horario_test.log";
                checkFileModification()
            } catch (err) {
                console.error('Error al parsear JSON:', err);
            }
        });
    }
}

// Función para leer y procesar el archivo
function readAndProcessFile() {
    let lines = []
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        // Escucha cada línea del archivo
        rl.on('line', (line) => {
            lines.push(line);
        });

        rl.on('close', () => {
            getTipoVariable(lines[0], (msjTVar) => {
                lines.splice(0, 1)
                getSitiosNombre(lines, (msjSit) => {

                    console.log(`${ID_MOD} - ${msjTVar} ${msjSit}`);
                    getNiveles(lines, 0, (err) => {
                        if (!err) {
                            getNuevosDatos((err, reporte) => {
                                if (!err) {
                                    transpilar(reporte);
                                }
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error(`Error al leer el archivo: ${error.message}`);
    }
}

function getNuevosDatos(callback) {
    historicoLecturaDAO.getMostRecent((err, rows) => {
        if (err) {
            console.error('Error fetching most recent records:', err);
            callback(err);
        } else {
            let remaining = rows.length;
            const updatedRows = [];

            if (remaining === 0) {
                callback(null, updatedRows);
                return;
            }

            rows.forEach(row => {
                tipoVariableDAO.getById(row.tipo_id, (err, tipoVarRow) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    sitioDAO.getById(row.sitio_id, (err, sitioRow) => {
                        if (err) {
                            callback(err);
                            return;
                        }

                        updatedRows.push({
                            ...row,
                            tipo_id: tipoVarRow.descriptor,
                            sitio_id: sitioRow.descriptor,
                            rebalse: sitioRow.rebalse
                        });

                        remaining -= 1;
                        if (remaining === 0) {
                            callback(null, updatedRows);
                        }
                    });
                });
            });
        }
    });
}

function getNuevosDatos2(callback) {
    historicoLecturaDAO.getMostRecent(async (err, rows) => {
        if (err) {
            console.error('Error fetching most recent records:', err);
            callback(err);
        } else {
            try {
                const updatedRows = await Promise.all(rows.map(async (row) => {

                    const tipoVariable = await new Promise((resolve, reject) => {
                        tipoVariableDAO.getById(row.tipo_id, (err, tipoVarRow) => {
                            if (err) reject(err);
                            else resolve(tipoVarRow);
                        });
                    });

                    const sitio = await new Promise((resolve, reject) => {
                        sitioDAO.getById(row.sitio_id, (err, sitioRow) => {
                            if (err) reject(err);
                            else resolve(sitioRow);
                        });
                    });

                    return {
                        ...row,
                        tipo_id: tipoVariable.descriptor,
                        sitio_id: sitio.descriptor
                    };
                }));

                callback(null, updatedRows);
            } catch (error) {
                console.error('Error fetching related records:', error.message);
                callback(error);
            }
        }
    });
}

// Función para verificar la fecha de modificación del archivo
function checkFileModification() {
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error(`Error al acceder al archivo: ${err.message}`);
            return;
        }

        const currentModifiedTime = stats.mtime;

        if (!lastModifiedTime || currentModifiedTime > lastModifiedTime) {
            const fechaActual = formatoFecha(currentModifiedTime);
            const fechaAnterior = formatoFecha(lastModifiedTime);
            lastModifiedTime = currentModifiedTime;

            console.log(`Actual ${fechaActual} ==> Anterior ${fechaAnterior}`);
            readAndProcessFile();
        } else {
            console.log(`${ID_MOD} - El archivo no ha sido modificado desde la última lectura`);
        }
    });
}

// Función para formatear la fecha
function formatoFecha(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    // Obtiene los componentes de la fecha
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const intervalId = setInterval(checkFileModification, checkInterval);

function parar() {
    clearInterval(intervalId);
    console.log(`${ID_MOD} - deteniendo observador`);
}

module.exports = { iniciar, parar };