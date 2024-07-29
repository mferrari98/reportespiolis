const { getDatabase } = require('./db');

const db = getDatabase();

function crearTablas(callback) {
  // tabla sitio
  db.run(
    `CREATE TABLE IF NOT EXISTS sitio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descriptor TEXT NOT NULL,
        orden INTEGER NOT NULL,
        rebalse FLOAT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creando tabla sitios', err.message);
        callback(err);
      } else {
        tablaTipoVariable(callback)
      }
    }
  );
}

// tabla tipo_variable
const tablaTipoVariable = (callback) => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tipo_variable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descriptor TEXT NOT NULL,
        orden INTEGER NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creando tabla tipo_variable', err.message);
        callback(err);
      } else {
        tablaHistoricosLectura(callback)
      }
    }
  );
}

// tabla 'historico_lectura'
const tablaHistoricosLectura = (callback) => {
  db.run(
    `CREATE TABLE IF NOT EXISTS historico_lectura (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sitio_id INTEGER NOT NULL,
      tipo_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      etiempo DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sitio_id) REFERENCES sitio(id),
      FOREIGN KEY (tipo_id) REFERENCES tipo_variable(id)
  )`,
    (err) => {
      if (err) {
        console.error('Error creando tabla historicos_lectura', err.message);
        callback(err);
      } else {
        console.log('CREAR-TABLA - Esquema de tablas creado correctamente');
        callback(null);
      }
    }
  );
}

module.exports = { crearTablas };