const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

let db;

function openDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al abrir la base de datos:', err.message);
      } else {
        console.log('DB - Conectado a la base de datos SQLite\n');
      }
    });
  }
}

function closeDatabase(cb) {

  db.close((err) => {
    if (err) {
      console.error('Error cerrando SQLite:', err.message);
    } else {
      console.log('SQLite cerrada.');
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