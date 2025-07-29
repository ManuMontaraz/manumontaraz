const fs = require('fs')
const path = require('path')
const { generateKeyPairSync } = require('crypto')
const mail = require('nodemailer')
const { translate } = require(path.join(__dirname, '..', '..', 'multilang', 'js', 'functions.js'))

const dkimKeysPath = path.join(__dirname, '..', 'keys')
const dkimPrivateKeyPath = path.join(dkimKeysPath, 'dkim-private.key')
const dkimPublicKeyPath = path.join(dkimKeysPath, 'dkim-public.key')

const emails = []

function check_dkim_keys() {
    // Verificar si las claves DKIM ya existen

    if (fs.existsSync(dkimPrivateKeyPath) && fs.existsSync(dkimPublicKeyPath)) {
        console.log("Ya existen las claves DKIM.");
        return true;
    } else {
        console.log("Claves DKIM no encontradas, generando nuevas claves...")
        
        // Generar clave RSA de 1024 bits
        const { publicKey, privateKey } = generateKeyPairSync("rsa", {
            modulusLength: 1024,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        })

        // Guardar las claves en archivos (opcional)
        fs.writeFileSync(dkimPrivateKeyPath, privateKey)
        fs.writeFileSync(dkimPublicKeyPath, publicKey)

        // Mostrar en consola (opcional)
        console.log(`Clave privada generada y guardada en ${dkimPrivateKeyPath}`)
        console.log(`Clave pública generada y guardada en ${dkimPublicKeyPath}`)
        return false
    }
}

function create_transporter(name) {

    if(!name)return console.error('Missing name parameter for create_transporter')

    const account = JSON.parse(process.env.MAIL_ACCOUNTS)[name]

    if (!account || !account.user || !account.password) return console.error(`Invalid account configuration for ${name}`)
    
    const user = `${account.user}@${process.env.DNS}`

    const transporter = mail.createTransport({
        host: process.env.MAIL_HOST, 
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_PORT == 465 ? true : process.env.MAIL_PORT == 587 ? false : null,
        auth: {
            user: user,
            pass: account.password
        },
        dkim: {
            domainName: process.env.DNS,
            keySelector: process.env.MAIL_DKIM_SELECTOR,
            privateKey: fs.readFileSync(dkimPrivateKeyPath, "utf8")
        }
    })

    const objectTransporter = {
        "name":name,
        "user":user,
        "transporter":transporter
    }

    emails.push(objectTransporter)
    
    return objectTransporter
}

function send_mail(template, to, language = "es", extraData = {}) {

    let from, subject, message

    const filePath = path.join(__dirname, '..', 'html', `${template}.html`)

    switch (template) {
        case "signup":

            let html = fs.readFileSync(filePath, 'utf8')
            if (!html){
                console.error(`No se encontró el archivo de plantilla "${template}" en la ruta: ${filePath}`)
                return false
            }

            // Convertir CSS a estilos inline
            html = css_to_inline(html)

            console.log("html:",html)

            from = "noreply"
            subject = translate(language, "[mlang:mail_signup_subject]")
            message = translate(language, html)

            //from = "noreply"
            //subject = "Bienvenido a Manu Montaraz"
            //message = "<h1>Gracias por registrarte en Manu Montaraz.</h1> Estamos encantados de tenerte con nosotros. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos."
        break
        default:
            console.error(`No se encontró el template "${template}"`)
            return false
    }

    //console.log("extraData",extraData)
    if(Object.entries(extraData).length > 0) {
        const extraDataEntries = Object.entries(extraData)
        for(let indexExtraData = 0 ; indexExtraData < extraDataEntries.length ; indexExtraData++) {
            const [key, value] = extraDataEntries[indexExtraData]
            console.log(`Reemplazando [${key}] por ${value}.`)
            message = message.replaceAll(`[${key}]`, value)
            subject = subject.replaceAll(`[${key}]`, value)
        }
    }

    console.log(from, to, subject, message)
    send_custom_mail(from, to, subject, message)
}

async function send_custom_mail(from, to, subject, message) {

    if (!from || !to || !subject || !message)return console.error('Missing required parameters for send_mail')

    const email = emails.find(email => email.name === from)

    let transporter

    if(email) {

        console.log(`Transporter found for ${from}:`, email.user)

        from = email.user
        transporter = email.transporter
    }else{
        console.log(`No transporter found from: ${from}\nCreating new transporter...`)
        const newEmail = create_transporter(from)

        if(!newEmail) return console.error(`Failed to create transporter for ${from}`)

        from = newEmail.user
        transporter = newEmail.transporter
    }

    console.log("llega1")
    const mailOptions = { 
        from: from,
        to: to,
        subject: subject,
        html: message
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent:', info.response)
        return "ok"
    } catch (error) {
        console.error('Error sending email:', error)
        return "ko"
    }
}

function css_to_inline(html) {
  // 1. Extraer el contenido de <style>
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const match = html.match(styleRegex);
  if (!match) return html;

  const css = match[1];
  let htmlSinStyle = html.replace(styleRegex, "");

  // 2. Parsear reglas CSS simples
  const reglas = css.match(/([^{]+)\{([^}]+)\}/g) || [];

  reglas.forEach(regla => {
    const [, selector, propiedades] = regla.match(/([^{]+)\{([^}]+)\}/);
    const estilos = propiedades.trim().replace(/\s+/g, " ");

    // Función para agregar estilos inline al elemento
    const agregarEstilo = (etiqueta) => {
      if (/style="/i.test(etiqueta)) {
        return etiqueta.replace(/style="([^"]*)"/i, (m, estilosPrevios) =>
          `style="${estilosPrevios.trim()} ${estilos}"`
        );
      } else {
        return `${etiqueta} style="${estilos}"`;
      }
    };

    // --- Selector de clase ---
    if (selector.trim().startsWith(".")) {
      const clase = selector.trim().slice(1);
      const regex = new RegExp(`(<[^>]*class=["'][^"']*\\b${clase}\\b[^"']*["'][^>]*)(>)`, "gi");
      htmlSinStyle = htmlSinStyle.replace(regex, (m, inicio, fin) =>
        agregarEstilo(inicio) + fin
      );

    // --- Selector de ID ---
    } else if (selector.trim().startsWith("#")) {
      const id = selector.trim().slice(1);
      const regex = new RegExp(`(<[^>]*id=["']${id}["'][^>]*)(>)`, "gi");
      htmlSinStyle = htmlSinStyle.replace(regex, (m, inicio, fin) =>
        agregarEstilo(inicio) + fin
      );

    // --- Selector por etiqueta ---
    } else {
      const tag = selector.trim();
      const regex = new RegExp(`(<${tag}[^>]*)(>)`, "gi");
      htmlSinStyle = htmlSinStyle.replace(regex, (m, inicio, fin) =>
        agregarEstilo(inicio) + fin
      );
    }
  });

  return htmlSinStyle;
}

module.exports = { check_dkim_keys, send_mail, send_custom_mail }