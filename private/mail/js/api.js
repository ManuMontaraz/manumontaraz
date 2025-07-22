const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { send_custom_mail, send_mail } = require(path.join(__dirname,'functions.js'))

// Ruta de mail
app.get('/api/mail', (_request, response) => {
  //response.json("Probando nodemailer")

  const to = _request.query.to
  const lang = _request.query.lang || "es"

  if (!to) {
    return response.status(400).json({ error: "Debes pasar el correo como query param 'to'" })
  }

  send_mail("signup", to, lang, {"name":"puto"})
  //send_custom_mail("noreply", to, "Probando nodemailer", "<style>#saludo{color:red;}</style><h1 id='saludo'>Hola,</h1><p>Esto es una prueba de nodemailer desde la API de Manu Montaraz.</p>")
  
  response.json({ message: `Correo enviado a ${to}` })

  //send_mail("noreply", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
  //send_mail("contact", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
})