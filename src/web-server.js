/*
lo podes probar con
  curl -Uri "http://10.10.4.125:3000/sitios" -Method POST -ContentType "application/json" -Body '{"descriptor":"ee3"}'
*/
const express = require('express');
const path = require('path');

const SitioDAO = require('./persistencia/sitioDAO');
const { openDatabase, closeDatabase } = require('./persistencia/db');
require('./persistencia/crear_tablas');
require('./etl/etl')

const app = express();
app.use(express.json());

// Middleware para configurar Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none' http://localhost:3000/; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000; style-src 'self' 'unsafe-inline' http://localhost:3000; img-src 'self' http://localhost:3000; connect-src 'self' http://localhost:3000");  
  next();
});

openDatabase();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/reporte', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/sitios', async (req, res) => {
  try {
    const sitios = await SitioDAO.getAllSitios();
    res.json(sitios);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/sitios/:id', async (req, res) => {
  try {
    const sitio = await SitioDAO.getSitioById(req.params.id);
    if (sitio) {
      res.json(sitio);
    } else {
      res.status(404).send('Sitio not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/sitios', async (req, res) => {
  try {    
    const newSitio = await SitioDAO.createSitio(req.body);
    res.status(201).json(newSitio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/sitios/:id', async (req, res) => {
  try {
    const updatedSitio = await SitioDAO.updateSitio(req.params.id, req.body);
    res.json(updatedSitio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/sitios/:id', async (req, res) => {
  try {
    await SitioDAO.deleteSitio(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const server = app.listen(3000, () => {
  console.log("WEB-SERVER - Escuchando p=3000\n");
});

process.on('SIGINT', () => {
  closeDatabase();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});