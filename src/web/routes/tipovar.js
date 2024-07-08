const express = require('express');
const router = express.Router();

const TipoVariableDAO = require('../../persistencia/tipoVariableDAO');
const tipoVariableDAO = new TipoVariableDAO();

router.get('/', async (req, res) => {

  tipoVariableDAO.getAll((err, rows) => {
    if (err) {
      console.error('Error fetching tipo_variable:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.json(rows); // Envía la respuesta como JSON con los registros obtenidos
    }
  });
});

module.exports = router;