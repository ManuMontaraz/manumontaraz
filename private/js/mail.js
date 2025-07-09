const mail = require('nodemailer')

const transporter_noreply = mail.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465 ? true : process.env.MAIL_PORT == 587 ? false : null,
    auth: {
        user: process.env.MAIL_NOREPLY,
        pass: process.env.MAIL_NOREPLY_PASS
    }
})

const transporter_contact = mail.createTransport({
    host: process.env.MAIL_HOST, 
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465 ? true : process.env.MAIL_PORT == 587 ? false : null,
    auth: {
        user: process.env.MAIL_CONTACT,
        pass: process.env.MAIL_CONTACT_PASS
    }
})

async function send_mail(from, to, subject, text) {

    if (!from || !to || !subject || !text)return console.error('Missing required parameters for send_mail')

    let transporter

    if (from === 'noreply') {
        from = process.env.MAIL_NOREPLY
        transporter = transporter_noreply
    }else if (from === 'contact') {
        from = process.env.MAIL_CONTACT
        transporter = transporter_contact
    } else {
        return console.error('Invalid sender type. Use "noreply" or "contact".')
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

module.exports = { send_mail }