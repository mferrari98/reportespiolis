function getTipoVariable(firstLine) {
    return firstLine.split(/\s{2,}/).filter(word => word.length > 0);
}

function getSitiosNombre(lines) {
    return lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);
}

function getSitiosNiveles(lines, indice) {
    return lines.map(line => {
        const parts = line.split(/\s{2,}/).filter(word => word.length > 0);
        return parts[indice + 1]; // +1 porque el primer elemento es el nombre
    }).filter(dato => dato !== undefined);
}

module.exports = {
    getTipoVariable,
    getSitiosNombre,
    getSitiosNiveles
};
