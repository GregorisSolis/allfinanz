const path = require('path')
const nodemailer = require('nodemailer')

const smtpTransport = require('nodemailer-smtp-transport')

const hbs = require('nodemailer-express-handlebars')

const transport = nodemailer.createTransport(smtpTransport({
  host: process.env.NODE_MAILER_HOST,
  port: process.env.NODE_MAILER_PORT,
  auth: { user: process.env.NODE_MAILER_USER, pass: process.env.NODE_MAILER_PASS }
}))


const handlebarOptions = {

  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/user/'),
    layoutsDir: path.resolve('./src/resources/mail/user/'),
    defaultLayout: 'forgot_password.html',
  },
  viewPath: path.resolve('./src/resources/mail/user/'),
  extName: '.html',
};


transport.use('compile', hbs(handlebarOptions));


module.exports = transport