const SitioDAO = require('../dao/sitioDAO');
const TipoVariableDAO = require('../dao/tipoVariableDAO');

const ID_MOD = "PARSER"

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();

function getTipoVariable(firstLine, cb) {

    let ids = []
    let cont_oper_ids = 0
    let tipo_variable = firstLine.split(/\s{2,}/).filter(word => word.length > 0);

    for (const [index, descriptor] of tipo_variable.entries()) {

        tipoVariableDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por descriptor:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el descriptor, se crea un nuevo registro
                    tipoVariableDAO.create(descriptor, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar tipo _variable:`, err);
                        } else {
                            console.log(`${ID_MOD} - Nuevo registro: { id: ${result.id}, descriptor: ${result.descriptor} }`);
                            ids[index] = result["id"]
                            cont_oper_ids++
                        }
                    });
                } else {
                    console.log(`${ID_MOD} - Registro encontrado:`, row);
                    ids[index] = row["id"]
                    cont_oper_ids++
                }
            }
            if (tipo_variable.length == cont_oper_ids)
                cb(ids)
        });
    }
}

function getSitiosNombre(lines, cb) {

    let ids = []
    let cont_oper_ids = 0
    let sitios = lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);

    for (const [index, descriptor] of sitios.entries()) {

        sitioDAO.getByDescriptor(descriptor, (err, row) => {
            if (err) {
                console.error(`${ID_MOD} - Error al buscar por descriptor:`, err);
            } else {
                if (!row) {
                    // Si no se encuentra el sitio, se crea un nuevo registro
                    sitioDAO.create(descriptor, (err, result) => {
                        if (err) {
                            console.error(`${ID_MOD} - Error al insertar sitio:`, err);
                        } else {
                            console.log(`${ID_MOD} - Nuevo registro: { id: ${result.id}, descriptor: ${result.descriptor} }`);
                            ids[index] = result["id"]
                            cont_oper_ids++
                        }
                    });
                } else {
                    console.log(`${ID_MOD} - Registro encontrado:`, row);
                    ids[index] = row["id"]
                    cont_oper_ids++
                }
            }
            if (sitios.length == cont_oper_ids)
                cb(ids)
        });
    }
}

/*
la linea .filter(dato => dato !== undefined && dato < 10) pretende filtrar
ademas del dato indefinido, aquellos que se van de rango, esto es util para 
no atrapar un volumen/dia como si fuera nivel.
no es la mejor manera de resolver esto, pero por ahora sirve
*/
function getSitiosNiveles(lines, id_tpo_var, id_sitio, indice) {
    let niveles = lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // +1 porque el primer elemento es el nombre
    }).filter(dato => dato !== undefined && dato < 10);

    console.log(id_tpo_var)
    console.log(id_sitio)

    return niveles
}

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    getSitiosNiveles
};
