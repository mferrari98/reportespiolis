const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');

const ID_MOD = "PARSER"

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();

function getTipoVariable(firstLine) {

    let tipo_variable = firstLine.split(/\s{2,}/).filter(word => word.length > 0);
    tipo_variable.forEach(descriptor => {

        tipoVariableDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por descriptor:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el descriptor, se crea un nuevo registro
                    tipoVariableDAO.create(descriptor, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar descriptor:`, err);
                        } else {
                            console.log(`${ID_MOD} - Nuevo registro creado: ID ${result.id}, nombre ${result.descriptor}`);
                        }
                    });
                } else {
                    console.log(`${ID_MOD} - Registro encontrado:`, row);
                }
            }
        });
    });

    return tipo_variable;
}

function getSitiosNombre(lines) {

    let sitios = lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);
    sitios.forEach(descriptor => {

        sitioDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por nombre:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el sitio, se crea un nuevo registro
                    sitioDAO.create(descriptor, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar sitio:`, err);
                        } else {
                            console.log(`${ID_MOD} - Nuevo registro creado: ID ${result.id}, nombre ${result.descriptor}`);
                        }
                    });
                } else {
                    console.log(`${ID_MOD} - Registro encontrado:`, row);
                }
            }
        });
    });
    return sitios
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

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    getSitiosNiveles
};
