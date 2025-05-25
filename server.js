// server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');
const socketIO = require('socket.io');
const http = require('http');

// Cargar variables de entorno
dotenv.config();

// Crear app Express
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Crear conexión a MariaDB
const db = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5
});

// Ruta de prueba
app.get('/status', (req, res) => {
  res.json({ mensaje: 'ok' });
});

// Crear servidor HTTP
const server = http.createServer(app);

// WebSocket con Socket.io
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('mensaje', (msg) => {
    console.log('Mensaje recibido:', msg);
    socket.broadcast.emit('mensaje', msg); 
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Arrancar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`);
});
