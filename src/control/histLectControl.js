const TipoVariableDAO = require("../dao/tipoVariableDAO");
const SitioDAO = require("../dao/sitioDAO");
const HistoricoLecturaDAO = require("../dao/historicoLecturaDAO");

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();

const ID_MOD = "CtrlHLect"

const fourHours = 4 * 60 * 60 * 1000; // 4 horas * 60 minutos * 60 segundos * 1000 ms
const cant_reportes = 20
const cant_sitios = 14
    
function HistLectControl() { }

HistLectControl.prototype.poblar = function (cb) {

    let remanente = cant_reportes * cant_sitios
    let acumulado = Array.from({ length: cant_reportes }, () => Array(cant_sitios).fill(undefined));
    let timestamp = Date.now() - (3 * 60 * 60 * 1000);  // restar 3 horas por GMT-3 (tiempo medio de Greenwich)
    
    tipoVariableDAO.getByDescriptor("Nivel[m]", (err1, tipoVariable) => {
        
        for (let i = 0; i < cant_reportes; i++) {      // insertar 20 reportes con datos aleatorios
            
            // estamapa de tiempo en formato ISO
            const estampa = new Date(timestamp - (fourHours * i)).toISOString()

            for (let j = 1; j <= cant_sitios; j++) {
                
                let valor = Math.random() * (4.5 - 0.1) + 0.1;
                valor = Math.floor(valor * 100) / 100;

                sitioDAO.getById(j, (err2, sitio) => {
                    if (err1 || err2) {
                        callback(`${err1,err2}`);
                        return;
                    }
                    
                    historicoLecturaDAO.create(
                        sitio.id,
                        tipoVariable.id,
                        valor,
                        estampa,
                        (err, result) => {
                            acumulado[i][j-1] = result
                            
                            remanente--                            
                            if (remanente == 0)
                                cb(acumulado)
                        }
                    )  
                })
            }
        }
    });
}

module.exports = HistLectControl;
