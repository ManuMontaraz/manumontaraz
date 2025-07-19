const path = require('path')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { send_mail } = require(path.join(__dirname,'functions.js'))

// Ruta de mail
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