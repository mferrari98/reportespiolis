const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-HISTORICO-LECTURA";

const sql_create = `INSERT INTO historico_lectura (sitio_id, tipo_id, valor) VALUES (?, ?, ?)`;
const sql_getById = `SELECT * FROM historico_lectura WHERE id = ?`;
const sql_getAll = `SELECT * FROM historico_lectura`;
const sql_update = `UPDATE historico_lectura SET sitio_id = ?, tipo_id = ?, valor = ?, etiempo = ? WHERE id = ?`;
const sql_delete = `DELETE FROM historico_lectura WHERE id = ?`;

function HistoricoLecturaDAO() { }

HistoricoLecturaDAO.prototype.create = function (sitio_id, tipo_id, valor, callback) {
  console.log(`${ID_MOD} - ${this.create.name}`);
  const db = getDatabase();

  db.run(sql_create, [sitio_id, tipo_id, valor], function (err) {
    if (err) {
      console.error('Error inserting into historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, { id: this.lastID, sitio_id, tipo_id, valor });
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

HistoricoLecturaDAO.prototype.update = function (id, sitio_id, tipo_id, valor, etiempo, callback) {
  console.log(`${ID_MOD} - update`);
  const db = getDatabase();

  db.run(sql_update, [sitio_id, tipo_id, valor, etiempo, id], function (err) {
    if (err) {
      console.error('Error updating historico_lectura:', err.message);
      callback(err);
    } else {
      callback(null, { changes: this.changes });
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