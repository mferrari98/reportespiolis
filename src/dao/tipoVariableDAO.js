const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-TPOVAR"

const sql_create = `INSERT INTO tipo_variable (descriptor) VALUES (?)`;
const sql_getById = `SELECT * FROM tipo_variable WHERE id = ?`;
const sql_getByDescriptor = `SELECT * FROM tipo_variable WHERE descriptor = ?`;
const sql_getAll = `SELECT * FROM tipo_variable`;
const sql_update = `UPDATE tipo_variable SET descriptor = ? WHERE id = ?`;
const sql_delete = `DELETE FROM tipo_variable WHERE id = ?`;

class TipoVariableDAO {

  create(descriptor, callback) {
    console.log(`${ID_MOD} - ${this.create.name}`)
    const db = getDatabase();

    db.run(sql_create, [descriptor], function (err) {
      if (err) {
        console.error('Error inserting into tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, { id: this.lastID });
      }
    });
  }

  getById(id, callback) {
    console.log(`${ID_MOD} - ${this.getById.name}`)
    const db = getDatabase();

    db.get(sql_getById, [id], (err, row) => {
      if (err) {
        console.error('Error fetching from tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, row);
      }
    });
  }

  getByDescriptor(descriptor, callback) {
    console.log(`${ID_MOD} - ${this.getByDescriptor.name}`);
    const db = getDatabase();

    db.get(sql_getByDescriptor, [descriptor], (err, row) => {
      if (err) {
        console.error('Error fetching from tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, row);
      }
    });
  }

  getAll(callback) {
    console.log(`${ID_MOD} - ${this.getAll.name}`)
    const db = getDatabase();

    db.all(sql_getAll, [], (err, rows) => {
      if (err) {
        console.error('Error fetching from tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, rows);
      }
    });
  }

  update(id, descriptor, callback) {
    console.log(`${ID_MOD} - ${this.update.name}`)
    const db = getDatabase();

    db.run(sql_update, [descriptor, id], function (err) {
      if (err) {
        console.error('Error updating tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  }

  delete(id, callback) {
    console.log(`${ID_MOD} - ${this.delete.name}`)
    const db = getDatabase();

    db.run(sql_delete, [id], function (err) {
      if (err) {
        console.error('Error deleting from tipo_variable:', err.message);
        callback(err);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  }
}

module.exports = TipoVariableDAO;