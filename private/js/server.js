// server.js
const fs = require('fs');
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const socketIO = require('socket.io')
const http = require('http')
const crypto = require('crypto')

// Cargar variables de entorno
dotenv.config()

// Crear app Express
const app = express()
app.use(express.json())

// Servir archivos dinámicos desde la carpeta public
app.get('/', (request, response) => { 
  const filePath = path.join(__dirname, '..', '..', 'public', 'index.html')
  fs.readFile(filePath, 'utf8', (error, html) => {
    if (error) {
      return response.status(500).send('Error leyendo el archivo')
    }

    // Reemplazar palabras clave
    // TO-DO: Hacer api para reemplazar palabras clave
    const replacedHtml = html
      .replace(/{{nombre}}/g, 'Juan')
      .replace(/{{fecha}}/g, new Date().toLocaleDateString())

    response
        .set('Content-Type', 'text/html')

    response.send(replacedHtml)
  })
})

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '..', '..', 'public'))) 

// Crear servidor HTTP
const server = http.createServer(app)

// WebSocket con Socket.io
const io = socketIO(server)

module.exports = { fs, path, app, jwt, io, crypto }
require('./mail.js')
require('./database.js')
require('./api.js')
require('./stripe.js')
require('./io.js')

// Arrancar servidor
const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`)
})


