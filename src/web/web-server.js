/*
lo podes probar con
  curl -Uri "http://10.10.4.125:3000/sitios" -Method POST -ContentType "application/json" -Body '{"descriptor":"ee3"}'
*/
const express = require('express');
const path = require('path');

const SitioDAO = require('../persistencia/sitioDAO');

const app = express();
app.use(express.json());

// Middleware para configurar Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "\
    default-src 'none' http://localhost:3000/;\
    script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000;\
    style-src 'self' 'unsafe-inline' http://localhost:3000;\
    img-src 'self' data: http://localhost:3000;\
    connect-src 'self' http://localhost:3000"
  );

  next();
});

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
  console.log(`WEBSERV - ${req.query}`)
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
  console.log(`WEBSERV - ${req.body}`)
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
  console.log("WEBSERV - Escuchando p=3000\n");
});

const connections = new Set();

server.on('connection', (conn) => {
  connections.add(conn);
  conn.on('close', () => {
    connections.delete(conn);
  });
});

function closeServer(cb) {

  console.log(`WEBSERV - destruyendo ${connections.size} conexion`);
  for (const conn of connections) {
    conn.destroy();
  }

  server.close(() => {
    console.log('Server closed');
    cb();
  });
}

module.exports = { closeServer };