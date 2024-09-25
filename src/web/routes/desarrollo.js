const express = require('express');
const router = express.Router();
const HistLectControl = require("../../control/histLectControl");

router.get('/', (req, res) => {

  const histLectControl = new HistLectControl();
  
  histLectControl.poblar((resultado) => {
    res.json({ message: 'poblando base de datos', resultado });
  })
});

module.exports = router