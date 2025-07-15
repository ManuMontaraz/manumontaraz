// api.js
const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { pool, jwt, login, logout, verify_token } = require(path.join(__dirname,'..','..','database','js','database.js'))
const test = require(path.join(__dirname,'..','..','test','js','test.js'))

//==== SESIÓN ====//

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

    console.log("token",queryData.token)

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

    //login(queryUser,queryPass,response)
}) 

// ==== RUTAS DE PRUEBA ====//

// Ruta de prueba
app.get('/api/status', (_request, response) => {
  response.json({"response": 'online'})
})

// Ruta de prueba2
app.get('/api', verify_token, (request, response) => {
  response.json({ "test": test.Holis, user: request.user.user })
})

// ==== NODEMAIL ====//
const { send_mail } = require(path.join(__dirname,'..','..','mail','js','mail.js'))

// Ruta de prueba
app.get('/api/mail', (_request, response) => {
  //response.json("Probando nodemailer")

  const to = _request.query.to;

  if (!to) {
    return response.status(400).json({ error: "Debes pasar el correo como query param 'to'" });
  }

  send_mail("noreply", to, "Probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz");
  
  response.json({ message: `Correo enviado a ${to}` });

  //send_mail("noreply", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
  //send_mail("contact", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
})

//==== TRADUCCION ====//

app.get('/api/language',(request, response) => { 
    
    if(!request.body)return

    response.json("Hola, soy la API de traducción de palabras clave, pero aún no existo :(")

    //TO-DO: Hacer api para traducir palabras clave
    
}) 

app.post('/api/language/set',(request, response) => { 
    
    if(!request.body)return

    const queryLang = request.body.lang

    const token = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null

    jwt.verify(token, process.env.JWT_SECRET, (error, authData) => {
        if (error) {
            console.log('Token inválido:', error)
            return response.status(403).json({ message: 'Token inválido' })
        } else {
            request.user = authData
        }
    })

    console.log(request.user)

    response.json(`Hola, quieres traducir la web en: '${queryLang}'`)

    //TO-DO: Hacer api para traducir palabras clave
    
}) 

//==== STRIPE ====//
const { get_stripe_products, stripe_pay } = require(path.join(__dirname,'..','..','stripe','js','stripe.js'))

// Ruta para obtener productos de Stripe
app.get('/api/stripe/products', async (_request, response) => {

    get_stripe_products(response)
    
})

// Ruta para crear un Payment Intent
app.post('/api/stripe/pay-intent', verify_token, async (request, response) => {
    
    stripe_pay(request, response)
    
})