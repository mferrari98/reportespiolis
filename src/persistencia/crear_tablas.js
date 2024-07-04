const { getDatabase, openDatabase } = require('./db');

openDatabase();
const db = getDatabase();

// tabla sitios
db.run(
  `CREATE TABLE IF NOT EXISTS sitios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descriptor TEXT NOT NULL,
      rebalse FLOAT
  )`,
  (err) => {
    if (err) {
      console.error('Error creando tabla sitios', err.message);
    } else {
      tablaTipoVariable()
    }
  }
);

// tabla tipo_variable
tablaTipoVariable = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tipo_variable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descriptor TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creando tabla tipo_variable', err.message);
      } else {
        tablaHistoricosLectura()
      }
    }
  );
}

// tabla 'historicos_lectura'
tablaHistoricosLectura = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS historicos_lectura (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sitio_id INTEGER NOT NULL,
      tipo_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      etiempo DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sitio_id) REFERENCES sitios(id),
      FOREIGN KEY (tipo_id) REFERENCES tipo_variable(id)
  )`,
    (err) => {
      if (err) {
        console.error('Error creando tabla historicos_lectura', err.message);
      } else {
        console.log('CREAR-TABLA - Esquema de tablas creado correctamente\n');
      }
    }
  );
}
