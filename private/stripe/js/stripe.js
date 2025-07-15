// stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function get_stripe_products(response) {

    try {
        const products = await stripe.products.list({
            limit: 3,
        })

        products.data[1].metadata.precio = await stripe.prices.retrieve(products.data[1].default_price)

        response.json(products.data[1])

    } catch (error) {
        response.status(400).send({ error: error.message })
    }

}

async function stripe_pay(request, response) {

    try {
        const { amount, currency } = request.body

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency
        })

        const paymentConfirm = await stripe.paymentIntents.confirm(paymentIntent.id,
            {
                payment_method: 'pm_card_visa',
                return_url: 'https://www.example.com',
            }
        )

        response.send({
            paymentIntent: paymentIntent,
            paymentConfirm: paymentConfirm,
        })
    } catch (error) {
        response.status(400).send({ error: error.message })
    }
}

module.exports = { get_stripe_products, stripe_pay }