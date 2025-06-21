// api.js
const { app, jwt, pool } = require('./server.js')
const test = require('./test.js')

app.post('/login',(request, response) => {
    
    if(!request.body)return
    
    const queryUser = request.body.user
    const queryPass = request.body.pass

    console.log(`usuario "${queryUser}" intentando iniciar sesión`)

    pool.query(
        `SELECT 
            id,
            name
        FROM users
        WHERE name = '${queryUser}'`
    ).then((responseDB)=>{
        
        const user = responseDB.rows[0]

        if (user.length === 0) {
            return response.status(404).json({ message: 'Usuario no encontrado' });
        }

        jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
            console.log(`usuario "${queryUser}" inició sesión correctamente`)
            response.json({ token })
        })
    })
})

// Ruta de prueba
app.get('/status', (request, response) => {
  response.json({"response": 'online'})
})

// Ruta de prueba2
app.get('/api',verifyToken, (request, response) => {
  response.json({ "test": test.Holis, user: request.user })
})

// Middleware para verificar el token
function verifyToken(request, response, next) {
    const bearerHeader = request.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1]

        jwt.verify(token, process.env.JWT_SECRET, (error, authData) => {
            if (error) {
                return response.status(403).json({ message: 'Token inválido' })
            } else {
                request.user = authData
                next()
            }
        })
    } else {
        response.status(401).json({ message: 'Token no proporcionado' })
    }
}

//==== STRIPE ====//
const { get_stripe_products, stripe_pay } = require('./stripe.js')

// Ruta para obtener productos de Stripe
app.get('/products', async (request, response) => {

    get_stripe_products(response)
    
})

// Ruta para crear un Payment Intent
app.post('/pay-intent', async (request, response) => {
    
    stripe_pay(request, response)
    
})