const { getDatabase } = require('./db');

class SitioDAO {
  static getAllSitios() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM sitios', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getSitioById(sitioId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM sitios WHERE id = ?', [sitioId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static createSitio(sitio) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      
      const { descriptor } = sitio;
      db.run('INSERT INTO sitios (descriptor) VALUES (?)', [descriptor], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...sitio });
        }
      });
    });
  }

  static updateSitio(sitioId, sitio) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { descriptor } = sitio;
      db.run('UPDATE sitios SET descriptor = ? WHERE id = ?', [descriptor, sitioId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: sitioId, ...sitio });
        }
      });
    });
  }

  static deleteSitio(sitioId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sitios WHERE id = ?', [sitioId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: sitioId });
        }
      });
    });
  }
}

module.exports = SitioDAO;