const mail = require('nodemailer')

const fs = require('fs')
const path = require('path')
const { generateKeyPairSync } = require('crypto')

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

async function send_mail(from, to, subject, text) {

    if (!from || !to || !subject || !text)return console.error('Missing required parameters for send_mail')

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

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent:', info.response)
    } catch (error) {
        console.error('Error sending email:', error)
    }
}

check_dkim_keys()
module.exports = { send_mail }