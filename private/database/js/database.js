// database.js
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

// Configura tu conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

// Crea un hash de la contraseña con un salt aleatorio
function hash_password(password, salt = crypto.randomBytes(32).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

// Verifica la contraseña ingresada con el hash almacenado
function verify_password(password, originalHash, salt) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

// Middleware para verificar el token
function verify_token(request, response, next) {
    const bearerHeader = request.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1]

        if(!token || token == "undefined"){
            console.log('Token no proporcionado')
            return response.status(401).json({ message: 'Token no proporcionado' })
        }

        jwt.verify(token, process.env.JWT_SECRET, (error, authData) => {
            if (error) {
                console.log('Token inválido:', error)
                return response.status(403).json({ message: 'Token inválido' })
            } else {
                request.user = authData
                next()
            }
        })
    } else {
        response.status(401).json({ message: 'Token no proporcionado' })
    }
}

module.exports = { pool, /*login, logout, signin, */verify_token, hash_password, verify_password }