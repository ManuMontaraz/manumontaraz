const path = require('path')
const fs = require('fs')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { verify_token } = require(path.join(__dirname,'..','..','database','js','database.js'))
const { login, logout, reset_password, signup, confirmation } = require(path.join(__dirname,'functions.js'))
const { translate, get_language } = require(path.join(__dirname,'..','..','multilang','js','functions.js'))

// Login manual de usuario
app.post('/api/login',(request, response) => {
    
    if(!request.body)return
    
    const queryData = {
        user: request.body.user,
        pass: request.body.pass,
        remember: request.body.remember
    }

    console.log(`usuario "${queryData.user}" intentando iniciar sesión`)

    login(queryData,response)
}) 

// Login jwt de usuario
app.post('/api/login/jwt',verify_token,(request, response) => {
    
    if(!request.body)return

    const queryData = {
        user: request.body.user,
        remember: request.body.remember,
        token: request.headers.authorization.split(' ')[1]
    }

    //console.log("token",queryData.token)

    console.log(`usuario "${queryData.user}" intentando iniciar sesión desde JWT`)

    login(queryData,response)
}) 

// Logout de usuario
app.post('/api/logout',verify_token,(request, response) => {
    
    if(!request.body)return
    
    const queryUser = request.body.user

    console.log(`usuario "${queryUser}" cerrando sesión`)

    logout(queryUser,response)
}) 

// Reset Password de usuario
app.post('/api/reset_password',(request, response) => {
    
    if(!request.body)return
    
    const queryEmail = request.body.email

    console.log(`enviando email de restauración de cuenta a "${queryEmail}"`)

    reset_password(queryEmail,response)
}) 

// Registro de usuario
app.post('/api/signup',(request, response) => {
    
    if(!request.body)return
    
    const queryName = request.body.name
    const queryLastName = request.body.lastName
    const queryUser = request.body.user
    const queryEmail = request.body.email
    const queryPass = request.body.pass
    const queryRepeatPass = request.body.repeatPass
    const queryRemember = request.body.remember
    const queryTerms = request.body.terms
    const queryNewsletter = request.body.newsletter
    const queryLanguage = request.body.language || "es"

    console.log(`usuario "${queryUser}" intentando registrarse`)

    const data = {
        name: queryName,
        lastName: queryLastName,
        user: queryUser,
        email: queryEmail,
        pass: queryPass,
        repeatPass: queryRepeatPass,
        remember: queryRemember,
        terms: queryTerms,
        newsletter: queryNewsletter,
        language:queryLanguage
    }

    signup(data,response)
}) 

// confirmación de cuenta
// Servir archivos dinámicos desde la carpeta public
app.get('/confirm', async (request, response) => { 

    const language = await get_language(request.headers.cookie) || "es"

    const code = request.query.code

    console.log(`confirmando cuenta con código "${code}".`)

    console.log(`Petición recibida en: ${language}`)

    const filePath = path.join(__dirname, '..', '..', '..', 'public', 'html', 'confirm.html')
    fs.readFile(filePath, 'utf8', async (error, html) => {
        if (error) {
            return response.status(500).send('Error leyendo el archivo')
        }

        const message = await translate(language,await confirmation(code))

        console.log(`Resultado de la confirmación2:`, message)

        let replacedHtml = await translate(language, html)
        replacedHtml = replacedHtml.replaceAll("[confirm:message]", message).replaceAll("[language]", language)

        response.set('Content-Type', 'text/html')
        response.send(replacedHtml)
    })
})

// Restablecer contraseña de usuario
// Servir archivos dinámicos desde la carpeta public
app.get('/restore_password', async (request, response) => { 

    const language = await get_language(request.headers.cookie) || "es"

    const code = request.query.code

    console.log(`confirmando cuenta con código "${code}".`)

    console.log(`Petición recibida en: ${language}`)

    const filePath = path.join(__dirname, '..', '..', '..', 'public', 'html', 'restore_password.html')
    fs.readFile(filePath, 'utf8', async (error, html) => {
        if (error) {
            return response.status(500).send('Error leyendo el archivo')
        }

        // TO-DO: Aquí debería verificar el código de restablecimiento de contraseña y enviar un mensaje de éxito o error al usuario.
        const message = await translate(language,await confirmation(code)) // cambiar funcion confirmation a reset_password

        console.log(`Resultado de la confirmación2:`, message)

        let replacedHtml = await translate(language, html)
        replacedHtml = replacedHtml.replaceAll("[restore_password:message]", message).replaceAll("[language]", language)

        response.set('Content-Type', 'text/html')
        response.send(replacedHtml)
    })
})

console.log("API de sesión cargada")