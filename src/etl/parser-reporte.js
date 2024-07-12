const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');

const ID_MOD = "PARSER"

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();

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
function getSitiosNiveles(lines, indice) {
    let niveles = lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // +1 porque el primer elemento es el nombre
    }).filter(dato => dato !== undefined && dato < 10);

    return niveles
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
    getSitiosNiveles
};
