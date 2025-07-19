// api.js
const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { pool, jwt, login, logout, verify_token, update_language } = require(path.join(__dirname,'..','..','database','js','database.js'))
const test = require(path.join(__dirname,'..','..','test','js','test.js'))

// ==== RUTAS DE PRUEBA ====//

// Ruta de prueba
app.get('/api/status', (_request, response) => {
  response.json({"response": 'online'})
})

// Ruta de prueba2
app.get('/api', verify_token, (request, response) => {
  response.json({ "test": test.Holis, user: request.user.user })
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