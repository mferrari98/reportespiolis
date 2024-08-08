const fs = require('fs');
const readline = require('readline');

const { getTipoVariable, getSitiosNombre, setNuevosDatos } = require('./parser-reporte');
const { transpilar } = require('./transpilador');

const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');
const HistoricoLecturaDAO = require('../dao/historicoLecturaDAO');
const RenderHTML = require("../reporte/index")

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();
const renderHTML = new RenderHTML();

const ID_MOD = "ETL"

let filePath = process.argv[2];

let currentModifiedTime

let lastModifiedTime = null;
const checkInterval = 4 * 1000; // tiempo verificacion de cambios en milisegundos

function iniciar() {
    // Verifica que se haya proporcionado el archivo como argumento
    if (process.argv.length < 3) {
        console.error(`${ID_MOD} - Parece que la ubicacion del achivo no llega como argumento de la linea de comandos`);
        console.error(`${ID_MOD} - Se utilizara la direccion definida en config.json`);

        fs.readFile('../config.json', 'utf8', (err, jsonString) => {
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
                    setNuevosDatos(lines, (err) => {
                        if (!err) {
                            getNuevosDatos((err, reporte) => {
                                if (!err) {
                                    transpilar(reporte, currentModifiedTime, () => {
                                        renderHTML.renderizar()
                                    });
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

            console.log(rows[0])
            
            rows.forEach(row => {
                tipoVariableDAO.getById(row.tipo_id, (err, tipoVarRow) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    let reporte = []
                    sitioDAO.getById(row.sitio_id, (err, sitioRow) => {
                        if (err) {
                            callback(err);
                            return;
                        }    
                        row["sitio_id"] = sitioRow.descriptor
                        row["tipo_id"] = {
                            "nivel" : (tipoVarRow.id == 1)? tipoVarRow.descriptor : "no aplica",
                            "cloro" : (tipoVarRow.id == 2)? tipoVarRow.descriptor : "no aplica"
                        }
                        row["rebalse"] = sitioRow.rebalse
                        
                        if(remaining == rows.length){
                            console.log(row)
                        }          
                        remaining -= 1;
                        if (remaining === 0) {                            
                            callback(null, rows);
                        }
                    });
                });
            });
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

        currentModifiedTime = stats.mtime;

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

console.log(`${ID_MOD} - Current working directory:`, process.cwd());
console.log(`${ID_MOD} - Directory of the current file:`, __dirname);