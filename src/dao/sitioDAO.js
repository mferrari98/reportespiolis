const { verLog } = require("../../config.json")
const { getDatabase } = require('../basedatos/db');

const ID_MOD = "DAO-SITIO";

const sql_create = `INSERT INTO sitio (descriptor, orden, rebalse) VALUES (?, ?, ?)`;
const sql_getById = `SELECT * FROM sitio WHERE id = ?`;
const sql_getByDescriptor = `SELECT * FROM sitio WHERE descriptor = ?`;
const sql_getByOrden = `SELECT * FROM sitio WHERE orden = ?`;
const sql_getAll = `SELECT * FROM sitio`;
const sql_cantSitios = `SELECT COUNT(*) as cant FROM sitio`;
const sql_delete = `DELETE FROM sitio WHERE id = ?`;

const rebalseMap = new Map([
  ['Toma(Rio)', 4.0],
  ['Toma(Des.)', 3.0],
  ['P.Pot', 3.0],
  ['L.Maria', 5.0],
  ['KM11', 5.0],
  ['B.SAN MIGUEL', 4.0],
  ['R6000', 4.0],
  ['B.OESTE(1K)', 5.0],
  ['NUEVA CHUBUT', 4.0],
  ['B.PUJOL', 3.0],
  ['Cota(126)', 4.0],
  ['Cota(45)', 4.0],
  ['Doradillo', 4.0],
  ['Cisterna Sur', 4.37]
]);

function SitioDAO() { }

SitioDAO.prototype.create = function (descriptor, orden, callback) {

  if (verLog)
    console.log(`${ID_MOD} - create`);

  const db = getDatabase();
  const rebalse = rebalseMap.get(descriptor) || 0.0;

  db.run(sql_create, [descriptor, orden, rebalse], function (err) {
    callback(null, { id: this.lastID, descriptor, orden, rebalse });
  });
};

SitioDAO.prototype.getById = function (id, callback) {

  if (verLog)
    console.log(`${ID_MOD} - getById`);

  const db = getDatabase();

  db.get(sql_getById, [id], (_, row) => {
    callback(null, row);
  });
};

SitioDAO.prototype.getByDescriptor = function (descriptor, callback) {

  if (verLog)
    console.log(`${ID_MOD} - getByDescriptor`);

  const db = getDatabase();

  db.get(sql_getByDescriptor, [descriptor], (_, row) => {
    callback(null, row);
  });
};

SitioDAO.prototype.getByOrden = function (orden, callback) {

  if (verLog)
    console.log(`${ID_MOD} - getByOrden`);

  const db = getDatabase();

  db.get(sql_getByOrden, [orden], (_, row) => {
    callback(null, row);
  });
};

SitioDAO.prototype.getAll = function (callback) {

  if (verLog)
    console.log(`${ID_MOD} - getAll`);

  const db = getDatabase();

  db.all(sql_getAll, [], (_, rows) => {
    callback(null, rows);
  });
};

SitioDAO.prototype.cantSitios = function (callback) {

  if (verLog)
    console.log(`${ID_MOD} - cantSitios`);

  const db = getDatabase();

  db.get(sql_cantSitios, [], (_, ret) => {
    callback(null, ret.cant);
  });
};

SitioDAO.prototype.delete = function (id, callback) {

  if (verLog)
    console.log(`${ID_MOD} - delete`);

  const db = getDatabase();

  db.run(sql_delete, [id], function (_) {
    callback(null, { id });
  });
};

module.exports = SitioDAO;