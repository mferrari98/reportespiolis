const fs = require('fs');
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

router.post('/imagenpt', (req, res) => {
    const imageData = req.body.image;

    // Decodificar la imagen base64
    const buffer = Buffer.from(imageData, 'base64');

    // Guardar la imagen en el servidor
    fs.writeFile('reporte/salida/graficoPLOTLY.png', buffer, (err) => {
        if (err) {
            console.error('Error al guardar la imagen:', err);
            return res.status(500).json({ message: 'Error al guardar la imagen' });
        }
        res.json({ message: 'Imagen guardada exitosamente' });
    });
});

module.exports = router;