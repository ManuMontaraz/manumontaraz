// api.js
const { app } = require('./server.js')
const { login, logout, verify_token } = require('./database.js')
const test = require('./test.js')

//==== SESIÓN ====//

// Login manual de usuario
app.post('/api/login',(request, response) => {
    
    if(!request.body)return
    
    const queryUser = request.body.user
    const queryPass = request.body.pass

    console.log(`usuario "${queryUser}" intentando iniciar sesión`)

    login(queryUser,queryPass,response)
}) 

// Login jwt de usuario
app.post('/api/login/jwt',verify_token,(request, response) => {
    
    if(!request.body)return

    const queryUser = request.body.user
    const token = request.headers.authorization.split(' ')[1]

    console.log("token",token)

    console.log(`usuario "${queryUser}" intentando iniciar sesión desde JWT`)

    login(queryUser,false,response,token)
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
const { send_mail } = require('./mail.js')

// Ruta de prueba
app.get('/api/mail', (_request, response) => {
  response.json("Probando nodemailer")

  send_mail("noreply", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
  send_mail("contact", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
})

//==== TRADUCCION ====//

app.get('/api/montrad',(request, response) => { 
    
    if(!request.body)return

    response.json("Hola, soy la API de traducción de palabras clave")

    //TO-DO: Hacer api para traducir palabras clave
    
}) 

//==== STRIPE ====//
const { get_stripe_products, stripe_pay } = require('./stripe.js')

// Ruta para obtener productos de Stripe
app.get('/api/stripe/products', async (_request, response) => {

    get_stripe_products(response)
    
})

// Ruta para crear un Payment Intent
app.post('/api/stripe/pay-intent', verify_token, async (request, response) => {
    
    stripe_pay(request, response)
    
})