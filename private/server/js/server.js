// server.js
const fs = require('fs');
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const http = require('http')

// Cargar variables de entorno
dotenv.config()

// Obtener el puerto del entorno
const port = process.env.PORT

// Crear app Express
const app = express()
app.use(express.json())

// Crear servidor HTTP
const server = http.createServer(app)

// Exportar app y servidor
module.exports = { app, server }

// Importar módulos necesarios
require(path.join(__dirname,'..','..','database','js','database.js'))
require(path.join(__dirname,'..','..','multilang','js','multilang.js'))
require(path.join(__dirname,'..','..','mail','js','mail.js'))
require(path.join(__dirname,'..','..','api','js','api.js'))
require(path.join(__dirname,'..','..','session','js','session.js'))
require(path.join(__dirname,'..','..','stripe','js','stripe.js'))
require(path.join(__dirname,'..','..','socketio','js','socketio.js'))

const { translate } = require(path.join(__dirname,'..','..','multilang','js','functions.js'))

// Servir archivos dinámicos desde la carpeta public
app.get('/', (request, response) => { 

    // TO-DO: Obtener el idioma de sesión si existe, si no existe, de cookie, si no existe, del header
    const language = request.headers.cookie.split(";").find(cookie => cookie.trim().startsWith("language=")).split("=")[1] || request.headers['accept-language'].split(";")[0].split(",")[1] || 'es'

    console.log(`Petición recibida en: ${language}`)

    const filePath = path.join(__dirname, '..', '..', '..', 'public', 'index.html')
    fs.readFile(filePath, 'utf8', (error, html) => {
        if (error) {
            return response.status(500).send('Error leyendo el archivo')
        }

        const replacedHtml = translate(language, html)

        response.set('Content-Type', 'text/html')
        response.send(replacedHtml)
    })
})

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '..', '..', '..', 'public'))) 

// Arrancar servidor
server.listen(port, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${port}`)
})


