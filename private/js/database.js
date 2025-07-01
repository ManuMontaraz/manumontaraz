// database.js
const { crypto, jwt } = require('./server.js')
const { Pool } = require('pg')

// Configura tu conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

function login(username, password, response, token = false) {

    // TO-DO: SI EN DB "REVOKE TOKEN", NO DEBERÍA PODER INICIAR SESIÓN CON JWT
    pool.query(
        `SELECT 
            username,
            name,
            last_name,
            email,
            password,
            password_salt
        FROM users
        WHERE username = $1
            OR email = $1`,
        [username]
    ).then((responseDB)=>{
            
        const user = responseDB.rows[0]

        if (!user || user.length === 0) {
            console.log(`usuario "${username}" no encontrado`)
            return response.status(404).json({ message: 'Usuario o contraseña incorrecta' })
        }

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (error, authData) => {
                if(error){
                    console.log('Token inválido:', error)
                }else if(authData.user !== user.username) {
                    console.log(`usuario "${username}" intentó iniciar sesión con un token inválido`)
                    return response.status(401).json({ message: 'Token inválido' })
                }
            })
        }else if(!verify_password(password, user.password, user.password_salt)) {
            console.log(`usuario "${username}" intentó iniciar sesión con una contraseña incorrecta`)
            return response.status(401).json({ message: 'Usuario o contraseña incorrecta' })
        }
        

        const userPayload = {user: user.username}

        /* REGISTRO (MAS O MENOS) USAR MÁS ADELANTE
        const passwordCosa = hash_password(password)
        console.log("passwordCosa",passwordCosa)

        pool.query(
            `UPDATE users 
            SET password = $2, password_salt = $3
            WHERE username = $1`,
            [
                username,
                passwordCosa.hash,
                passwordCosa.salt
            ]
        )
        */

        // TO-DO: SI CHECK "RECUERDAME" == true: TOKEN EXPIRA EN 7 DÍAS; SI NO: EN 1 HORA
        jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' }, (_error, token) => {
            if (_error) {
                console.error('Error al firmar el token:', _error)
                return response.status(500).json({ error: 'Error interno' })
            }
            console.log(`usuario "${username}" inició sesión correctamente`)
            response.setHeader('Set-Cookie', `montarazSession=${token}; Path=/; Max-Age=3600; SameSite=Strict`);
            response.json({token, name:user.name, last_name:user.last_name, message: 'Inicio de sesión correcto'})
        })
    })
}

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

module.exports = { login, verify_token }