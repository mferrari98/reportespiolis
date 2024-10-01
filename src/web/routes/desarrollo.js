const express = require('express');
const router = express.Router();
const HistLectControl = require("../../control/controlHistoricoLect");

const histLectControl = new HistLectControl();

router.get('/poblar', (req, res) => {

  histLectControl.poblar((resultado) => {
    res.json({ message: 'poblando base de datos', resultado });
  })
});

router.get('/truncar', (req, res) => {

  histLectControl.truncate((resultado) => {
    res.json({ message: 'vaciando bd', resultado });
  })
});

module.exports = router