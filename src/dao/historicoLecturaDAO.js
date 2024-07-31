const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-HISTORICO-LECTURA";

const sql_create = `INSERT INTO historico_lectura (sitio_id, tipo_id, valor, etiempo) VALUES (?, ?, ?, ?)`;
const sql_getById = `SELECT * FROM historico_lectura WHERE id = ?`;
const sql_getAll = `SELECT * FROM historico_lectura`;
const sql_getMostRecent = `
  SELECT hl.*
  FROM historico_lectura hl
  JOIN sitio s ON hl.sitio_id = s.id
  WHERE hl.etiempo = (SELECT MAX(etiempo) FROM historico_lectura)
  ORDER BY s.orden;
`;
const sql_delete = `DELETE FROM historico_lectura WHERE id = ?`;

function HistoricoLecturaDAO() { }

HistoricoLecturaDAO.prototype.create = function (sitio_id, tipo_id, valor, etiempo, callback) {
  console.log(`${ID_MOD} - create`);
  const db = getDatabase();

  db.run(sql_create, [sitio_id, tipo_id, valor, etiempo], function (err) {
    if (err) {
      console.error('Error inserting into historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, { id: this.lastID, sitio_id, tipo_id, valor, etiempo });
    }
  });
};

HistoricoLecturaDAO.prototype.getById = function (id, callback) {
  console.log(`${ID_MOD} - getById`);
  const db = getDatabase();

  db.get(sql_getById, [id], (err, row) => {
    if (err) {
      console.error('Error fetching from historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, row);
    }
  });
};

HistoricoLecturaDAO.prototype.getAll = function (callback) {
  console.log(`${ID_MOD} - getAll`);
  const db = getDatabase();

  db.all(sql_getAll, [], (err, rows) => {
    if (err) {
      console.error('Error fetching from historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

HistoricoLecturaDAO.prototype.getMostRecent = function (callback) {
  console.log(`${ID_MOD} - getMostRecent`);
  const db = getDatabase();

  db.all(sql_getMostRecent, [], (err, rows) => {
    if (err) {
      console.error('Error fetching most recent records from historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

HistoricoLecturaDAO.prototype.delete = function (id, callback) {
  console.log(`${ID_MOD} - delete`);
  const db = getDatabase();

  db.run(sql_delete, [id], function (err) {
    if (err) {
      console.error('Error deleting from historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, { changes: this.changes });
    }
  });
};

module.exports = HistoricoLecturaDAO;