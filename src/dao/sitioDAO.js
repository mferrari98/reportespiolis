const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-SITIO";

const sql_create = `INSERT INTO sitio (descriptor, rebalse) VALUES (?, ?)`;
const sql_getById = `SELECT * FROM sitio WHERE id = ?`;
const sql_getByDescriptor = `SELECT * FROM sitio WHERE descriptor = ?`;
const sql_getAll = `SELECT * FROM sitio`;
const sql_update = `UPDATE sitio SET descriptor = ? WHERE id = ?`;
const sql_delete = `DELETE FROM sitio WHERE id = ?`;

const rebalseMap = new Map([
  ['Toma(Rio)', 4.0],
  ['Toma(Des.)', 3.0],
  ['P.Pot', 3.0],
  ['L.Maria', 5.0],
  ['KM11', 5.0],
  ['R6000', 4.0],
  ['B.PUJOL', 3.0],
  ['B.OESTE(1K)', 5.0],
  ['B.SAN MIGUEL', 3.8],
  ['NUEVA CHUBUT', 4.0],
  ['PLANTA POT.', 0.0]
]);

function SitioDAO() { }

SitioDAO.prototype.create = function (descriptor, callback) {
  console.log(`${ID_MOD} - create`);
  const db = getDatabase();

  const rebalse = rebalseMap.get(descriptor) || 0.0;

  db.run(sql_create, [descriptor, rebalse], function (err) {
    if (err) {
      console.error(`${ID_MOD} - Error inserting into Sitio:`, err.message);
      callback(err);
    } else {
      callback(null, { id: this.lastID, descriptor, rebalse });
    }
  });
};

SitioDAO.prototype.getById = function getById(id, callback) {
  console.log(`${ID_MOD} - getById`);
  const db = getDatabase();

  db.get(sql_getById, [id], (err, row) => {
    if (err) {
      console.error('Error fetching from Sitio:', err.message);
      callback(err);
    } else {
      callback(null, row);
    }
  });
};

SitioDAO.prototype.getByDescriptor = function (descriptor, callback) {
  console.log(`${ID_MOD} - getByDescriptor`);
  const db = getDatabase();

  db.get(sql_getByDescriptor, [descriptor], (err, row) => {
    if (err) {
      console.error('Error fetching from Sitio:', err.message);
      callback(err);
    } else {
      callback(null, row);
    }
  });
};

SitioDAO.prototype.getAll = function (callback) {
  console.log(`${ID_MOD} - getAll`);
  const db = getDatabase();

  db.all(sql_getAll, [], (err, rows) => {
    if (err) {
      console.error('Error fetching from Sitio:', err.message);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

SitioDAO.prototype.update = function (id, descriptor, callback) {
  console.log(`${ID_MOD} - update`);
  const db = getDatabase();

  db.run(sql_update, [descriptor, id], function (err) {
    if (err) {
      console.error('Error updating Sitio:', err.message);
      callback(err);
    } else {
      callback(null, { id, descriptor });
    }
  });
};

SitioDAO.prototype.delete = function (id, callback) {
  console.log(`${ID_MOD} - delete`);
  const db = getDatabase();

  db.run(sql_delete, [id], function (err) {
    if (err) {
      console.error('Error deleting from Sitio:', err.message);
      callback(err);
    } else {
      callback(null, { id });
    }
  });
};

module.exports = SitioDAO;