const path = require('path')
const jwt = require('jsonwebtoken')
const { getUserByUsernameOrEmail } = require(path.join(__dirname, 'queries.js'))
const { verify_password } = require(path.join(__dirname, '..', '..', 'database', 'js', 'database.js'))


function logout(username, response) {
    console.log(`usuario "${username}" cerró sesión correctamente`)
    response.setHeader('Set-Cookie', 'montarazSession=; Path=/; Max-Age=0; SameSite=Strict') // Elimina la cookie de sesión
    return response.json({ message: 'Sesión cerrada correctamente' })
}

async function login(data, response) {

    const username = data.user
    const password = data.pass
    const token = data.token

    let remember = data.remember
            
    const user = await getUserByUsernameOrEmail(username)

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

            remember = authData.remember
        })
    }else if(!verify_password(password, user.password, user.password_salt)) {
        console.log(`usuario "${username}" intentó iniciar sesión con una contraseña incorrecta`)
        return response.status(401).json({ message: 'Usuario o contraseña incorrecta' })
    }
    
    const userPayload = {
        user: user.username,
        remember:remember
    }

    //SI CHECK "RECUERDAME" == true: TOKEN EXPIRA EN 7 DÍAS, SI == false: EN 1 HORA
    jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: remember?'7d':'1h'}, (_error, token) => {
        if (_error) {
            console.error('Error al firmar el token:', _error)
            return response.status(500).json({ error: 'Error interno' })
        }
        console.log(`usuario "${username}" inició sesión correctamente`)
        
        response.setHeader('Set-Cookie', `montarazSession=${token}; Path=/; Max-Age=${remember?'604800':'3600'}; SameSite=Strict`)
        response.json({token, name:user.name, last_name:user.last_name, message: 'Inicio de sesión correcto'})
    })
}

function signin(){
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
}

module.exports = { login, logout, signin }