const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-TPOVAR"

const sql_create = `INSERT INTO tipo_variable (descriptor) VALUES (?)`;
const sql_getById = `SELECT * FROM tipo_variable WHERE id = ?`;
const sql_getByDescriptor = `SELECT * FROM tipo_variable WHERE descriptor = ?`;
const sql_getAll = `SELECT * FROM tipo_variable`;
const sql_update = `UPDATE tipo_variable SET descriptor = ? WHERE id = ?`;
const sql_delete = `DELETE FROM tipo_variable WHERE id = ?`;

function TipoVariableDAO() { }

TipoVariableDAO.prototype.create = function (descriptor, callback) {
  console.log(`${ID_MOD} - ${this.create.name}`)
  const db = getDatabase();

  db.run(sql_create, [descriptor], function (err) {
    if (err) {
      console.error('Error inserting into tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, { id: this.lastID, descriptor });
    }
  });
};

TipoVariableDAO.prototype.getById = function (id, callback) {
  console.log(`${ID_MOD} - getById`);
  const db = getDatabase();

  db.get(sql_getById, [id], (err, row) => {
    if (err) {
      console.error('Error fetching from tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, row);
    }
  });
};

TipoVariableDAO.prototype.getByDescriptor = function (descriptor, callback) {
  console.log(`${ID_MOD} - getByDescriptor`);
  const db = getDatabase();

  db.get(sql_getByDescriptor, [descriptor], (err, row) => {
    if (err) {
      console.error('Error fetching from tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, row);
    }
  });
};

TipoVariableDAO.prototype.getAll = function (callback) {
  console.log(`${ID_MOD} - getAll`);
  const db = getDatabase();

  db.all(sql_getAll, [], (err, rows) => {
    if (err) {
      console.error('Error fetching from tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

TipoVariableDAO.prototype.update = function (id, descriptor, callback) {
  console.log(`${ID_MOD} - update`);
  const db = getDatabase();

  db.run(sql_update, [descriptor, id], function (err) {
    if (err) {
      console.error('Error updating tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, { changes: this.changes });
    }
  });
};

TipoVariableDAO.prototype.delete = function (id, callback) {
  console.log(`${ID_MOD} - delete`);
  const db = getDatabase();

  db.run(sql_delete, [id], function (err) {
    if (err) {
      console.error('Error deleting from tipo_variable:', err.message);
      callback(err);
    } else {
      callback(null, { changes: this.changes });
    }
  });
};

module.exports = TipoVariableDAO;