const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const ID_MOD = "DB"

const dbPath = path.resolve(__dirname, 'database.sqlite');

let db;

function openDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al abrir la base de datos:', err.message);
      } else {
        console.log(`${ID_MOD} - Conectado a la base de datos SQLite`);
      }
    });
  }
}

function closeDatabase(cb) {
  db.close((err) => {
    if (err) {
      console.error(`${ID_MOD} - Error cerrando SQLite:`, err.message);
    } else {
      console.log(`${ID_MOD} - SQLite cerrada`);
    }
    cb()
  });
}

function getDatabase() {
  if (!db) {
    openDatabase();
  }
  return db;
}

module.exports = {
  openDatabase,
  closeDatabase,
  getDatabase,
};