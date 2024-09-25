const { verLog } = require("../../config.json")

const SitioDAO = require("../dao/sitioDAO");
const TipoVariableDAO = require("../dao/tipoVariableDAO");
const HistoricoLecturaDAO = require("../dao/historicoLecturaDAO");
const EmailMensaje = require("./emailMensaje");
const { transpilar } = require("../etl/transpilador");

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();
const emailMensaje = new EmailMensaje();

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
    historicoLecturaDAO.getMostRecent((_, rows) => {

        let remaining = rows.length;

        sitioDAO.cantSitios((_, cantidad) => {
            var reporte = new Array(cantidad);

            rows.forEach((row) => {
                tipoVariableDAO.getById(row.tipo_id, (err, tipoVarRow) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    sitioDAO.getById(row.sitio_id, (err, sitioRow) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        historicoLecturaDAO.getHistorico(sitioRow.id, (_, historico) => {

                            armarObjetoReporte(reporte, row, tipoVarRow, sitioRow, historico);
                            remaining -= 1;

                            if (remaining === 0) {
                                callback(null, reporte);
                            }
                        })
                    });
                });
            });
        });
    });
}

function armarObjetoReporte(reporte, row, tipoVarRow, sitioRow, historicos) {
    let descrip_nivel, val_nivel;
    let descrip_cloro, val_cloro;
    let descrip_turb, val_turb;
    let descrip_voldia, val_voldia;

    try {
        descrip_nivel = reporte[sitioRow.orden].variable.nivel.descriptor;
        val_nivel = reporte[sitioRow.orden].variable.nivel.valor;
    } catch (error) { }

    try {
        descrip_cloro = reporte[sitioRow.orden].variable.cloro.descriptor;
        val_cloro = reporte[sitioRow.orden].variable.cloro.valor;
    } catch (error) { }

    try {
        descrip_turb = reporte[sitioRow.orden].variable.turbiedad.descriptor;
        val_turb = reporte[sitioRow.orden].variable.turbiedad.valor;
    } catch (error) { }

    try {
        descrip_voldia = reporte[sitioRow.orden].variable.voldia.descriptor;
        val_voldia = reporte[sitioRow.orden].variable.voldia.valor;
    } catch (error) { }

    reporte[sitioRow.orden] = {
        sitio: sitioRow.descriptor,
        variable: {
            nivel: {
                descriptor:
                    tipoVarRow.orden == 0 ? tipoVarRow.descriptor : descrip_nivel,
                valor: tipoVarRow.orden == 0 ? row.valor : val_nivel,
                rebalse: sitioRow.rebalse,
                historico: historicos
            },
            cloro: {
                descriptor:
                    tipoVarRow.orden == 1 ? tipoVarRow.descriptor : descrip_cloro,
                valor: tipoVarRow.orden == 1 ? row.valor : val_cloro,
            },
            turbiedad: {
                descriptor:
                    tipoVarRow.orden == 2 ? tipoVarRow.descriptor : descrip_turb,
                valor: tipoVarRow.orden == 2 ? row.valor : val_turb,
            },
            voldia: {
                descriptor:
                    tipoVarRow.orden == 3 ? tipoVarRow.descriptor : descrip_voldia,
                valor: tipoVarRow.orden == 3 ? row.valor : val_voldia,
            },
        }
    };
}

module.exports = { lanzarReporte };

if (verLog) {
    console.log(`${ID_MOD} - Directorio trabajo:`, process.cwd());
    console.log(`${ID_MOD} - Directorio del archivo:`, __dirname);
}