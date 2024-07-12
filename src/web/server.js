/*
lo podes probar con
  curl -Uri "http://10.10.4.125:3000/sitios" -Method POST -ContentType "application/json" -Body '{"descriptor":"ee3"}'
*/
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

/*
Middleware para configurar Content-Security-Policy
*/
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "\
    default-src 'none' http://localhost:3000/;\
    script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000;\
    style-src 'self' 'unsafe-inline' http://localhost:3000;\
    img-src 'self' data: blob: http://localhost:3000;\
    connect-src 'self' http://localhost:3000"
  );

  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
/*
alta de rutas para organizar mejor el codigo
*/
const sitioRoutes = require('./routes/sitio');
const tipoVarRoutes = require('./routes/tipovar');
const otherRoutes = require('./routes/general');

app.use('/sitios', sitioRoutes);
app.use('/tipovar', tipoVarRoutes);
app.use('/', otherRoutes);

/*
levantar server
*/
const server = app.listen(3000, () => {
  console.log("WEBSERV - Escuchando p=3000\n");
});

/*
gestionar conexiones abiertas
para poder hacer un cierre autoritario cuando sea necesario
*/
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
    console.log('WEBSERV - Server closed');
    cb();
  });
}

module.exports = { closeServer };