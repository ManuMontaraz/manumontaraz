const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { verify_token } = require(path.join(__dirname,'..','..','database','js','database.js'))
const { get_stripe_products, stripe_pay } = require(path.join(__dirname,'functions.js'))

// Ruta para obtener productos de Stripe
app.get('/api/stripe/products', async (_request, response) => {

    get_stripe_products(response)
    
})

// Ruta para crear un Payment Intent
app.post('/api/stripe/pay-intent', verify_token, async (request, response) => {
    
    stripe_pay(request, response)
    
})