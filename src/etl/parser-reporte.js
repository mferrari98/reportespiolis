const SitioDAO = require('../persistencia/sitioDAO');


function getTipoVariable(firstLine) {
    let tipo_variable = firstLine.split(/\s{2,}/).filter(word => word.length > 0);
    console.log(tipo_variable)

    return tipo_variable
}

function getSitiosNombre(lines) {
    let sitios = lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);
    console.log(sitios)

    return sitios
}

function getSitiosNiveles(lines, indice) {
    let niveles = lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // +1 porque el primer elemento es el nombre
    }).filter(dato => dato !== undefined);
    console.log(niveles)

    return niveles
}

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    getSitiosNiveles
};
