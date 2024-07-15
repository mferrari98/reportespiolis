const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');
const HistoricoLecturaDAO = require('../dao/historicoLecturaDAO');

const ID_MOD = "PARSER"

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();

function getTipoVariable(firstLine, cb) {

    let entidades_creadas = 0
    let entidades_existentes = 0

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
function getNiveles(lines, indice, callback) {
    let niveles = lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // 1 porque 0 es el primer elemento, que es el nombre
    }).filter(dato => dato !== undefined && dato < 10);

    tipoVariableDAO.getByDescriptor("Nivel[m]", (err, tipoVariable) => {
        if (err) {
            callback(err);
            return;
        }

        const timestamp = new Date().toISOString();
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

async function getNiveles2(lines, indice) {

    let niveles = lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // 1 porque 0 es el primer elemento, que es el nombre
    }).filter(dato => dato !== undefined && dato < 10);

    const tipoVariable = await new Promise((resolve, reject) => {
        tipoVariableDAO.getByDescriptor("Nivel[m]", (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    const timestamp = new Date().toISOString();

    for (let i = 0; i < niveles.length; i++) {
        const valor = niveles[i];

        const sitio = await new Promise((resolve, reject) => {
            sitioDAO.getByOrden(i, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        await new Promise((resolve, reject) => {
            historicoLecturaDAO.create(sitio.id, tipoVariable.id, valor, timestamp, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        console.log(`${ID_MOD} - Insertado historico_lectura {${sitio.descriptor}:${tipoVariable.descriptor}:${valor}}`);
    }
}

function finValidacion(tipo_variable, entidades_creadas, entidades_existentes) {
    return tipo_variable.length == (entidades_creadas + entidades_existentes)
}

function mensaje(origen, cont1, cont2) {
    return origen + ` creadas=${cont1} existentes=${cont2}`
}

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    getNiveles
};
