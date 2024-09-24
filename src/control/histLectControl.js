const TipoVariableDAO = require("../dao/tipoVariableDAO");
const SitioDAO = require("../dao/sitioDAO");
const HistoricoLecturaDAO = require("../dao/historicoLecturaDAO");

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();

const ID_MOD = "CtrlHLect"

const fourHours = 4 * 60 * 60 * 1000; // 4 horas * 60 minutos * 60 segundos * 1000 ms
const cant_sitios = 14
    
function HistLectControl() { }

HistLectControl.prototype.poblar = function () {

    let timestamp = Date.now();
    
    tipoVariableDAO.getByDescriptor("Nivel[m]", (err1, tipoVariable) => {
        
        for (let i = 0; i < 20; i++) {      // insertar 20 reportes con datos aleatorios
            for (let j = 1; j <= cant_sitios; j++) {
                
                let valor = Math.random() * (4.5 - 0.1) + 0.1;

                sitioDAO.getById(j, (err2, sitio) => {
                    if (err1 || err2) {
                        callback(`${err1,err2}`);
                        return;
                    }
                    const estampa = new Date(timestamp - (fourHours * (j - 1))).toISOString()
                    
                    historicoLecturaDAO.create(
                        sitio.id,
                        tipoVariable.id,
                        valor,
                        estampa,
                        (err, result) => { 
                            console.log(result)
                        }
                    )
                })
            }
        }
    });
}

module.exports = HistLectControl;
