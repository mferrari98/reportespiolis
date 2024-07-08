const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
});

router.get('/reporte', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;