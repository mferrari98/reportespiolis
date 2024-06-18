
function getHeaders(firstLine) {
    return firstLine.split(/\s{2,}/).filter(word => word.length > 0);
}

function getFirstWords(lines) {
    return lines.map(line => line.split(/\s{2,}/)[0]).filter(word => word !== undefined);
}

module.exports = {
    getHeaders,
    getFirstWords
};