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

    //const link = `https://${_request.get('host')}`
    let link = `https://${process.env.DNS}`
    if(process.env.SUBDOMAIN){
        link = `https://${process.env.SUBDOMAIN}.${process.env.DNS}`
    }

    let contact = `${JSON.parse(process.env.MAIL_ACCOUNTS).contact.user}@${process.env.DNS}` || ""

    send_mail("signup", to, lang, {"name":"puto", "web_name": process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.${process.env.DNS}` : process.env.DNS, "link":new URL(`/confirm?user=montaraz&mail=montarazmanu@gmail.com`,link), "contact_email":contact, "author": process.env.AUTHOR})
    //send_custom_mail("noreply", to, "Probando nodemailer", "<style>#saludo{color:red;}</style><h1 id='saludo'>Hola,</h1><p>Esto es una prueba de nodemailer desde la API de Manu Montaraz.</p>")
    
    response.json({ message: `Correo enviado a ${to}` })

    //send_mail("noreply", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
    //send_mail("contact", "maarblan@gmail.com", "probando nodemailer", "Hola, esto es una prueba de nodemailer desde la API de Manu Montaraz")
})