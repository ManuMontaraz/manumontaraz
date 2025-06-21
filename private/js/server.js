// server.js
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const socketIO = require('socket.io')
const http = require('http')

// Cargar variables de entorno
dotenv.config()


// Crear app Express
const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', '..', 'public')))

const pool = require('./database.js')

// Crear servidor HTTP
const server = http.createServer(app)

// WebSocket con Socket.io
const io = socketIO(server)

module.exports = { app, jwt, io, pool }
require('./api.js')
require('./stripe.js')
require('./io.js')

// Arrancar servidor
const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`)
})


