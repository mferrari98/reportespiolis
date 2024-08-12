const {
  getTipoVariable,
  getSitiosNombre,
  setNuevosDatos,
} = require("./parser-reporte");
const { transpilar } = require("./transpilador");

const SitioDAO = require("../dao/sitioDAO");
const TipoVariableDAO = require("../dao/tipoVariableDAO");
const HistoricoLecturaDAO = require("../dao/historicoLecturaDAO");
const RenderHTML = require("../reporte/index");

const tipoVariableDAO = new TipoVariableDAO();
const sitioDAO = new SitioDAO();
const historicoLecturaDAO = new HistoricoLecturaDAO();
const renderHTML = new RenderHTML();

const ID_MOD = "ETL";

function lanzarETL(lines, currentModifiedTime) {
  
  getTipoVariable(lines[0], (msjTVar) => {

    lines.splice(0, 1);
    getSitiosNombre(lines, (msjSit) => {

      console.log(`${ID_MOD} - ${msjTVar} ${msjSit}`);
      setNuevosDatos(lines, (err) => {

        if (!err) {
          getNuevosDatos((err, reporte) => {

            if (!err) {
              transpilar(reporte, currentModifiedTime, () => {
                renderHTML.renderizar();
              });
            }
          });
        }
      });
    });
  });   
}

function getNuevosDatos(callback) {
  historicoLecturaDAO.getMostRecent((err, rows) => {
    if (err) {
      console.error("Error fetching most recent records:", err);
      callback(err);
    } else {
      let remaining = rows.length;

      sitioDAO.cantSitios((err, cantidad) => {
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

              armarObjetoReporte(reporte, row, tipoVarRow, sitioRow)
              remaining -= 1;

              if (remaining === 0) {
                callback(null, reporte);
              }
            });
          });
        });
      });
    }
  });
}

function armarObjetoReporte(reporte, row, tipoVarRow, sitioRow) {
  let descrip_nivel, val_nivel;
  let descrip_cloro, val_cloro;
  let descrip_turb, val_turb;

  try {
    descrip_nivel =
      reporte[sitioRow.orden].variable.nivel.descriptor;
    val_nivel =
      reporte[sitioRow.orden].variable.nivel.valor;
  } catch (error) { }
  
  try {
    descrip_cloro =
      reporte[sitioRow.orden].variable.cloro.descriptor;
    val_cloro =
      reporte[sitioRow.orden].variable.cloro.valor;
  } catch (error) { }

  try {
    descrip_turb =
      reporte[sitioRow.orden].variable.turbiedad.descriptor;
    val_turb =
      reporte[sitioRow.orden].variable.turbiedad.valor;
  } catch (error) { }

  reporte[sitioRow.orden] = {
    sitio: sitioRow.descriptor,
    variable: {
      nivel: {
        descriptor:
          tipoVarRow.orden == 0 ? tipoVarRow.descriptor : descrip_nivel,
        valor: tipoVarRow.orden == 0 ? row.valor : val_nivel,
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
      }
    },
    rebalse: sitioRow.rebalse,
  };
}

module.exports = { lanzarETL };

console.log(`${ID_MOD} - Directorio trabajo:`, process.cwd());
console.log(`${ID_MOD} - Directorio del archivo:`, __dirname);
