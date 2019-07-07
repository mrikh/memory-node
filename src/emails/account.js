const sgMail  = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendVerificationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mayankrikh@gmail.com',
        subject : 'Welcome!',
        text : `Welcome ${name}. Please click the button to verify your account.`
    })
}

module.exports = {
    sendVerificationMail
}