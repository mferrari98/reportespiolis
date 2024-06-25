const { getDatabase, openDatabase } = require('./db');

openDatabase();
const db = getDatabase();

db.run(
  `CREATE TABLE IF NOT EXISTS sitios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descriptor TEXT NOT NULL
  )`,
  (err) => {
    if (err) {
      console.error('Error creando tabla', err.message);
    } else {
      console.log('Tabla creada correctamente');
    }
  }
);
