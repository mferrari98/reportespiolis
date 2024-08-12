const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');
const HistoricoLecturaDAO = require('../dao/historicoLecturaDAO');

const ID_MOD = "PARSER"
const SIN_DETERMINAR = "s/d"

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();

function getTipoVariable(firstLine, cb) {

    let entidades_creadas = 0
    let entidades_existentes = 0

    /*
    es importante este filtro porque evita crear instancias como consecuencia de un objeto mal parseado
    */
    let tipo_variable = firstLine.split(/\s{2,}/).filter(word => word.length > 0);

    for (const [index, descriptor] of tipo_variable.entries()) {

        tipoVariableDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por descriptor:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el descriptor, se crea un nuevo registro
                    tipoVariableDAO.create(descriptor, index, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar tipo_variable:`, err);
                        } else {
                            entidades_creadas++
                            if (finValidacion(tipo_variable, entidades_creadas, entidades_existentes))
                                cb(mensaje("[TpoVar]", entidades_creadas, entidades_existentes))
                        }
                    });
                } else {
                    entidades_existentes++
                    if (finValidacion(tipo_variable, entidades_creadas, entidades_existentes))
                        cb(mensaje("[TpoVar]", entidades_creadas, entidades_existentes))
                }
            }
        });
    }
}

function getSitiosNombre(lines, cb) {

    let entidades_creadas = 0
    let entidades_existentes = 0

    let sitios = lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);

    for (const [index, descriptor] of sitios.entries()) {

        sitioDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por descriptor:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el descriptor, se crea un nuevo registro
                    sitioDAO.create(descriptor, index, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar sitio:`, err);
                        } else {
                            entidades_creadas++
                            if (finValidacion(sitios, entidades_creadas, entidades_existentes))
                                cb(mensaje("[Sitio]", entidades_creadas, entidades_existentes))
                        }
                    });
                } else {
                    entidades_existentes++
                    if (finValidacion(sitios, entidades_creadas, entidades_existentes))
                        cb(mensaje("[Sitio]", entidades_creadas, entidades_existentes))
                }
            }
        });
    }
}

/*
la linea .filter(dato => dato !== undefined && dato < 10) pretende filtrar
ademas del dato indefinido, aquellos que se van de rango, esto es util para 
no atrapar un volumen/dia como si fuera nivel.
no es la mejor manera de resolver esto, pero por ahora sirve
*/
function setNuevosDatos(lines, callback) {

    const lineas_modif = agregarNulos(lines, 16)
    const timestamp = new Date().toISOString();

    insertarNiveles(lineas_modif, timestamp, () => {
        insertarCloro(lineas_modif, timestamp, () => {
            insertarTurbiedad(lineas_modif, timestamp, () => {
                callback()
            })
        })
    })
}

function insertarNiveles(lineas_modif, timestamp, callback) {

    const niveles = getColumna(lineas_modif, 1)
    tipoVariableDAO.getByDescriptor("Nivel[m]", (err, tipoVariable) => {
        if (err) {
            callback(err);
            return;
        }

        let remaining = niveles.length;

        if (remaining === 0) {
            callback(null);
            return;
        }

        for (let i = 0; i < niveles.length; i++) {
            const valor = niveles[i];

            sitioDAO.getByOrden(i, (err, sitio) => {
                if (err) {
                    callback(err);
                    return;
                }

                historicoLecturaDAO.create(sitio.id, tipoVariable.id, valor, timestamp, (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    console.log(`${ID_MOD} - Insertado historico_lectura {${sitio.descriptor}:${tipoVariable.descriptor}:${valor}}`);

                    remaining -= 1;
                    if (remaining === 0) {
                        callback(null);
                    }
                });
            });
        }
    });
}

function insertarCloro(lineas_modif, timestamp, callback) {

    const cloro = getColumna(lineas_modif, 2)
    tipoVariableDAO.getByDescriptor("Cloro[mlg/l]", (err, tipoVariable) => {
        if (err) {
            callback(err);
            return;
        }

        let remaining = cloro.length;

        if (remaining === 0) {
            callback(null);
            return;
        }

        for (let i = 0; i < cloro.length; i++) {
            const valor = cloro[i];

            sitioDAO.getByOrden(i, (err, sitio) => {
                if (err) {
                    callback(err);
                    return;
                }

                historicoLecturaDAO.create(sitio.id, tipoVariable.id, valor, timestamp, (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    console.log(`${ID_MOD} - Insertado historico_lectura {${sitio.descriptor}:${tipoVariable.descriptor}:${valor}}`);

                    remaining -= 1;
                    if (remaining === 0) {
                        callback(null);
                    }
                });
            });
        }
    });
}

function insertarTurbiedad(lineas_modif, timestamp, callback) {

    const turbiedad = getColumna(lineas_modif, 3)
    tipoVariableDAO.getByDescriptor("Turbiedad[UTN]", (err, tipoVariable) => {
        if (err) {
            callback(err);
            return;
        }

        let remaining = turbiedad.length;

        if (remaining === 0) {
            callback(null);
            return;
        }

        for (let i = 0; i < turbiedad.length; i++) {
            const valor = turbiedad[i];

            sitioDAO.getByOrden(i, (err, sitio) => {
                if (err) {
                    callback(err);
                    return;
                }

                historicoLecturaDAO.create(sitio.id, tipoVariable.id, valor, timestamp, (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    console.log(`${ID_MOD} - Insertado historico_lectura {${sitio.descriptor}:${tipoVariable.descriptor}:${valor}}`);

                    remaining -= 1;
                    if (remaining === 0) {
                        callback(null);
                    }
                });
            });
        }
    });
}

function finValidacion(tipo_variable, entidades_creadas, entidades_existentes) {
    return tipo_variable.length == (entidades_creadas + entidades_existentes)
}

function mensaje(origen, cont1, cont2) {
    return origen + ` creadas=${cont1} existentes=${cont2}`
}

/**
 * recorre cada línea de texto en `lines` y agrega un marcador donde los blancos exceden un umbral (`threshold`).
 * El objetivo es insertar este marcador en los lugares donde se espera que haya un valor, pero está ausente,
 * basado en la longitud del espacio en blanco entre los valores existentes. 
 * 
 * @param {string[]} lines - Un arreglo de cadenas de texto, donde cada cadena representa una línea que 
 * contiene diferentes valores separados por espacios en blanco.
 * @param {number} threshold - Un número entero que representa la cantidad máxima de espacios consecutivos 
 * permitidos antes de insertar el marcador.
 * 
 * @returns {string[]} - Un arreglo de cadenas de texto en donde todas las filas
 * poseen la misma cantidad de columnas, lo que facilita el tratamiento del fuente
 */
function agregarNulos(lines, threshold) {
    const modifiedLines = [];

    for (let line of lines) {
        let modifiedLine = '';
        let spaceCount = 0;
        let i = 0;

        // Recorrer la línea carácter por carácter
        while (i < line.length) {            
            if (line[i] === ' ') {
                spaceCount++;
                if (spaceCount > threshold) {
                    modifiedLine += ' '+SIN_DETERMINAR; // Insertar un 0 si el espacio es mayor que el umbral
                    spaceCount = 0;
                }
            } else {
                if(spaceCount > 0)
                    modifiedLine += " "
                
                /*
                si no encuenta un blanco, copia la linea en la salida tal como la
                leyó en la antrada "modifiedLine += line[i]"
                */
                modifiedLine += line[i];
                spaceCount = 0;
            }
            i++;
        }
        modifiedLines.push(modifiedLine);
    }

    return modifiedLines;
}

/**
 * Extrae los valores de una columna específica de un arreglo de líneas
 * 
 * @param {Array<string>} modifiedLines - Un arreglo de líneas de texto, cada una representando
 *                                         una fila de datos
 * @param {number} numCol - El índice de la columna de la que se desea extraer los valores. 
 *                           Debe ser un número entero que representa la posición de la columna
 * @returns {Array<number>} Un arreglo que contiene los valores de la columna especificada para
 *                           cada línea.
 */
function getColumna(modifiedLines, numCol) {
    
    const columnValues = [];
    const regex = /\s(?=\d|\bs\/d)|(?<=\d|\bs\/d)\s/g;

    for (let line of modifiedLines) {
        
        /*
        dividir linea solo cuando hay un número a los lados del espacio
        este patron resuelve falsos positivo como se daria en "B.SAN MIGUEL 1.2" -> [B.SAN, MIGUEL, 1.2, ...]
        cuando lo correcto es [B.SAN MIGUEL, 1.2, ...]
        */
        const parts = line.split(regex);        
        
        // Si la columna solicitada existe en la línea, añadirla al arreglo
        if (parts.length > numCol) {
            const value = parseFloat(parts[numCol]);
            columnValues.push(isNaN(value) ? parts[numCol] : value);
        } else {
            columnValues.push(SIN_DETERMINAR); // O cualquier otro valor que indique que la columna no existe
        }
    }

    return columnValues;
}

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    setNuevosDatos,
    sindet: SIN_DETERMINAR
};
