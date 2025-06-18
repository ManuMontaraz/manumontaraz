const { app, stripe } = require('./server.js')

app.post('/create-payment-intent', async (request, response) => {
    try {
        const { amount, currency } = request.body

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency
        })

        response.send({
            clientSecret: paymentIntent.client_secret,
        })
    } catch (error) {
        response.status(400).send({ error: error.message })
    }
})