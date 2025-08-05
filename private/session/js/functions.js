const path = require('path')
const jwt = require('jsonwebtoken')
const { send } = require('process')
const { getUserByUsernameOrEmail, generateKeyForResetPassword, signupUser, confirmUser } = require(path.join(__dirname, 'queries.js'))
const { verify_password, hash_password } = require(path.join(__dirname, '..', '..', 'database', 'js', 'database.js'))
const { send_mail } = require(path.join(__dirname, '..', '..', 'mail', 'js', 'functions.js'))


function logout(username, response) {
    
    if (!username) {
        console.log('No se proporcionó un usuario para cerrar sesión')
        return response.status(400).json({ message: 'Usuario no proporcionado' })
    }

    //TO-DO: Verificar si el usuario está autenticado y es el mismo antes de cerrar sesión
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
        response.json({token, name:user.name, last_name:user.last_name, message: 'Inicio de sesión correcto', language: user.language || 'es' }) // Devuelve el token y el nombre del usuario
    })
}

async function reset_password(email, response) {
    if (!email) {
        console.log('Email no proporcionado para restablecer la contraseña')
        return response.status(400).json({ message: 'Email no proporcionado' })
    }

    console.log(`Enviando instrucciones para restablecer la contraseña al correo "${email}"`)
    const data = await generateKeyForResetPassword(email)

    if (!data) {
        console.log(`Error al generar el código de restablecimiento de contraseña para el email "${email}"`)
        return response.status(500).json({ message: 'Error al generar el código de restablecimiento de contraseña' })
    }

    console.log("data",data)

    let link = `https://${process.env.DNS}`
    if(process.env.SUBDOMAIN){
        link = `https://${process.env.SUBDOMAIN}.${process.env.DNS}`
    }

    let contact = `${JSON.parse(process.env.MAIL_ACCOUNTS).contact.user}@${process.env.DNS}` || ""

    // Enviar correo de restablecimiento de contraseña
    send_mail(
        'reset_password',
        email,
        data.language,
        {
            "name": data.name,
            "contact_email": contact,
            "link": new URL(`/restore_password?code=${data.reset_password_code}`,link)
        }
    )

    // Aquí deberías enviar un correo electrónico con las instrucciones para restablecer la contraseña
    // Por ahora, solo devolvemos un mensaje de éxito
    response.json({ message: `Instrucciones para restablecer la contraseña enviadas a ${email}` })
}

async function signup(data, response){

    console.log("data",data)

    if (!data || !data.user || !data.email || !data.pass || !data.repeatPass || !data.terms) {
        console.log('Datos de registro incompletos')
        return response.status(400).json({ message: 'Datos de registro incompletos' })
    }

    if (data.pass !== data.repeatPass) {
        console.log('Las contraseñas no coinciden')
        return response.status(400).json({ message: 'Las contraseñas no coinciden' })
    }

    if (!data.terms) {
        console.log('Debe aceptar los términos y condiciones')
        return response.status(400).json({ message: 'Debe aceptar los términos y condiciones' })
    }

    const existingUser = await getUserByUsernameOrEmail(data.user)
    const existingEmail = await getUserByUsernameOrEmail(data.email)

    if ((existingUser && existingUser.length > 0) || (existingEmail && existingEmail.length > 0)) {
        console.log(`El usuario "${data.user}" ya existe`)
        return response.status(409).json({ message: 'El usuario ya existe' })
    }

    const hashPassword = hash_password(data.pass)

    console.log("hashPassword",hashPassword)

    const newUser = {
        username: data.user,
        email: data.email,
        password: hashPassword.hash,
        password_salt: hashPassword.salt,
        name: data.name || '',
        last_name: data.lastName || '',
        terms: data.terms,
        newsletter: data.newsletter || false,
        language: data.language || 'es'
    }

    const result = await signupUser(newUser)

    if (result.status === 'ok') {
        console.log(`usuario "${data.user}" registrado correctamente`)
        
        let link = `https://${process.env.DNS}`
        if(process.env.SUBDOMAIN){
            link = `https://${process.env.SUBDOMAIN}.${process.env.DNS}`
        }

        let contact = `${JSON.parse(process.env.MAIL_ACCOUNTS).contact.user}@${process.env.DNS}` || ""

        // Enviar correo de bienvenida
        send_mail(
            'signup',
            data.email,
            data.language,
            {
                "name": data.name,
                "web_name": process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.${process.env.DNS}` : process.env.DNS,
                "link": new URL(`/confirm?code=${result.confirmation_code}`,link),
                "contact_email": contact,
                "author": process.env.AUTHOR
            }
        )

        response.json({ message: 'Usuario registrado correctamente, revisa tu correo para confirmar tu cuenta' })
    }else{
        console.log(`Error al registrar el usuario "${data.user}"`)
        response.status(500).json({ message: 'Error al registrar el usuario' })
    }
}

async function confirmation(code, response) {

    if (!code) {
        console.log('Datos de confirmación incompletos')
        return '[mlang:confirm_message_error]'
    }

    // TO-DO: Implementar la lógica de confirmación de cuenta
    console.log(`Confirmando cuenta con código "${code}"`)

    const result = await confirmUser(code)

    console.log(`Resultado de la confirmación:`, result)

    return result.message
    
    // Aquí deberías verificar el código y activar la cuenta del usuario
    // Por ahora, solo devolvemos un mensaje de éxito
    //response.json({ message: `Cuenta confirmada con código ${code}` })
}

module.exports = { login, logout, reset_password, signup, confirmation }