const path = require('path')
const fs = require('fs')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { verify_token } = require(path.join(__dirname,'..','..','database','js','database.js'))
const { login, logout, signup } = require(path.join(__dirname,'functions.js'))
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
/*
app.get('/confirm',(request, response) => {
    
    if(!request.query.user || !request.query.mail){
        return response.status(400).json({ error: "Debes pasar el usuario y el correo como query params 'user' y 'mail'" })
    }

    const user = request.query.user
    const mail = request.query.mail

    console.log(`usuario "${user}" confirmando cuenta con correo ${mail}`)

    response.json({ message: `Cuenta de usuario "${user}" confirmada correctamente` })
})
*/


// Servir archivos dinámicos desde la carpeta public
app.get('/confirm', async (request, response) => { 

    if(!request.query.user || !request.query.mail){
        return response.status(400).json({ error: "Debes pasar el usuario y el correo como query params 'user' y 'mail'" })
    }

    const user = request.query.user
    const mail = request.query.mail

    console.log(`usuario "${user}" confirmando cuenta con correo ${mail}`)
    
    // TO-DO: Obtener el idioma de sesión si existe, si no existe, de cookie, si no existe, del header
    const language = await get_language(request.headers.cookie) || "es"//request.headers.cookie.split(";").find(cookie => cookie.trim().startsWith("language=")).split("=")[1] || request.headers['accept-language'].split(";")[0].split(",")[1] || 'es'

    console.log(`Petición recibida en: ${language}`)

    const filePath = path.join(__dirname, '..', '..', '..', 'public', 'html', 'confirm.html')
    fs.readFile(filePath, 'utf8', (error, html) => {
        if (error) {
            return response.status(500).send('Error leyendo el archivo')
        }

        const replacedHtml = translate(language, html)

        response.set('Content-Type', 'text/html')
        response.send(replacedHtml)
    })
})

console.log("API de sesión cargada")