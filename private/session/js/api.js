const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { verify_token } = require(path.join(__dirname,'..','..','database','js','database.js'))
const { login, logout, signin } = require(path.join(__dirname,'functions.js'))

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
app.post('/api/logout',(request, response) => {
    
    if(!request.body)return
    
    const queryUser = request.body.user

    console.log(`usuario "${queryUser}" cerrando sesión`)

    logout(queryUser,response)
}) 

// Registro de usuario
app.post('/api/signin',(request, response) => {
    
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

    console.log(`usuario "${queryUser}" intentando registrarse`)

    signin(queryUser,queryPass,response)
}) 

console.log("API de sesión cargada")