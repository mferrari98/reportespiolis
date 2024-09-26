const express = require('express');
const router = express.Router();
const HistLectControl = require("../../control/histLectControl");

router.get('/poblar', (req, res) => {

  const histLectControl = new HistLectControl();
  
  histLectControl.poblar((resultado) => {
    res.json({ message: 'poblando base de datos', resultado });
  })
});

router.get('/truncar', (req, res) => {

  const histLectControl = new HistLectControl();

  histLectControl.truncate((resultado) => {
    res.json({ message: 'vaciando bd', resultado });
  })
});

module.exports = router