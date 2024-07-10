const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-SITIO"

const sql_create = `INSERT INTO sitio (descriptor) VALUES (?)`;
const sql_getById = `SELECT * FROM sitio WHERE id = ?`;
const sql_getAll = `SELECT * FROM sitio`;
const sql_update = `UPDATE sitio SET descriptor = ? WHERE id = ?`;
const sql_delete = `DELETE FROM sitio WHERE id = ?`;

class SitioDAO {

  create(descriptor, callback) {
    console.log(`${ID_MOD} - ${this.create.name}`)
    const db = getDatabase();

    db.run(sql_create, [descriptor], function (err) {
      if (err) {
        console.error('Error inserting into Sitio:', err.message);
        callback(err);
      } else {
        callback(null, { id: this.lastID, descriptor });
      }
    });
  }

  getById(id, callback) {
    console.log(`${ID_MOD} - ${this.getById.name}`)
    const db = getDatabase();

    db.get(sql_getById, [id], (err, row) => {
      if (err) {
        console.error('Error fetching from Sitio:', err.message);
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
        console.error('Error fetching from Sitio:', err.message);
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
        console.error('Error updating Sitio:', err.message);
        callback(err);
      } else {
        callback(null, { id, descriptor });
      }
    });
  }

  delete(id, callback) {
    console.log(`${ID_MOD} - ${this.delete.name}`)
    const db = getDatabase();

    db.run(sql_delete, [id], function (err) {
      if (err) {
        console.error('Error deleting from Sitio:', err.message);
        callback(err);
      } else {
        callback(null, { id });
      }
    });
  }
}

module.exports = SitioDAO;