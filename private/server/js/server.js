// Copyright (C) 2025 Manu Montaraz 
 
// server.js
import fs from 'fs'
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import dns from 'dns'
import rateLimit from 'express-rate-limit'
import EventEmitter from 'node:events'
import { fileURLToPath } from 'url';
import { dirname } from "path";

import { translate } from '../../multilang/js/functions.js'

// Obtener __dirname en ESM
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config()

// Obtener el puerto del entorno
const port = process.env.PORT

// Configurar limitador de peticiones
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limitar cada IP a 100 peticiones por ventana
    message: 'Demasiadas peticiones, por favor intente de nuevo más tarde.'
})

// Crear app Express
export const app = express()

dns.lookup(process.env.DNS, (error, address) => {
    const debug = false

    if (error) { 
        console.error(`No se pudo resolver el dominio: ${process.env.DNS}`)
        console.error(err)
        process.exit(1) // Salir si falla la resolución
    }
 
    console.log(`Dirección IP del proxy: ${address}`)
    
    app.set('trust proxy', address)
    app.use(limiter) 
    app.use(express.json())

    // Crear servidor HTTP
    const server = http.createServer(app)

    // Servir archivos dinámicos desde la carpeta public
    app.get('/', async (request, response) => { 
        
        const language = await get_language(request.headers.cookie) || "es"

        if(debug) console.log(`Petición recibida en: ${language}`)
            
        const filePath = path.join(__dirname, '..', '..', '..', 'public', 'html', 'index.html')
        fs.readFile(filePath, 'utf8', async (error, html) => {
            if (error) {
                return response.status(500).send('Error leyendo el archivo')
            }

            let replacedHtml = html.replaceAll("[language]", language)
            replacedHtml = await translate(language, replacedHtml)

            if(debug) console.log(`Archivo HTML traducido para el idioma ${language}:\n`, replacedHtml)

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
})

