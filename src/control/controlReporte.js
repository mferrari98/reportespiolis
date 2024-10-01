const { verLog } = require("../../config.json").desarrollo

const SitioDAO = require("../dao/sitioDAO");
const TipoVariableDAO = require("../dao/tipoVariableDAO");
const HistoricoLecturaDAO = require("../dao/historicoLecturaDAO");
const EmailMensaje = require("../reporte/emailMensaje");
const Reporte = require("../modelo/reporte")
const { transpilar } = require("../etl/transpilador");

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();
const emailMensaje = new EmailMensaje();
const reporte = new Reporte()

const ID_MOD = "REPORTE";

let lanzarReporte = function (evSCADA, currentModifiedTime, cb) { 
    getNuevosDatos((err, reporte) => {        
        if (!err) {
            transpilar(reporte, currentModifiedTime, () => {
                cb()
                if (evSCADA) {
                    emailMensaje.extraerTabla();
                    emailMensaje.renderizar();    
                }
            });
        }
    });
}

/* ===========================================================
===================== FUNCIONES INTERNAS =====================
==============================================================
*/

function getNuevosDatos(callback) {
    
    sitioDAO.getTodosDescriptores((_, descriptores) => {        
        // el objeto reporte se crea siempre, aunque no hay datos para agregar
        reporte.declarar(descriptores, (mi_reporte) => {

            historicoLecturaDAO.getMostRecent((_, rows) => {
                
                let remaining = rows.length;
                rows.forEach((row) => {
                    
                    tipoVariableDAO.getById(row.tipo_id, (err, tipoVarRow) => {
                        sitioDAO.getById(row.sitio_id, (err, sitioRow) => {
                            historicoLecturaDAO.getHistorico(sitioRow.id, (_, historico) => {

                                completarReporte(mi_reporte, row, tipoVarRow, sitioRow, historico);
                                remaining -= 1;
                                
                                if (remaining === 0)
                                    callback(null, mi_reporte);
                            })
                        });
                    });
                });
                if (remaining === 0)
                    callback(null, mi_reporte);
            });
        })
    });
}

function completarReporte(reporte, row, tipoVarRow, sitioRow, historicos) {

    const indice_prop = tipoVarRow.orden
    const variableKeys = Object.keys(reporte[sitioRow.orden].variable);

    reporte[sitioRow.orden].variable[variableKeys[indice_prop]].valor = row.valor
    reporte[sitioRow.orden].variable.nivel.historico = historicos
}

module.exports = { lanzarReporte };

if (verLog) {
    console.log(`${ID_MOD} - Directorio trabajo:`, process.cwd());
    console.log(`${ID_MOD} - Directorio del archivo:`, __dirname);
}