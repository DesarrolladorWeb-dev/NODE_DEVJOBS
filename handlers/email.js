const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host : emailConfig.host,
    port : emailConfig.port,
    auth: {
        user : emailConfig.user,
        pass: emailConfig.pass
    }
});
console.log("0")

const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: 'views',//your path, views is a folder inside the source folder
      layoutsDir: 'views',
      defaultLayout: ''//set this one empty and provide your template below,
    },
    viewPath: 'views',
    extName: '.handlebars',
  };

  console.log("1")

  transport.use('compile', hbs(handlebarOptions));

// Utilizar templates de Handlebars
// transport.use('compile', hbs({
//     viewEngine : 'handlebars',
//     viewPath : __dirname+'/../views/emails',
// //    partialsDir: __dirname+'/../views/emails/partials',
//     extName: '.handlebars'
// }));


// console.log("2")

exports.enviar = async (opciones) => {
// transport.use('compile', hbs(emailConfig));

    console.log(opciones)
    const mailOptions = {
        from: '"Spammy Corp." <ad.timely@gmail.com>',
        to: 'nipunkavishka@gmail.com',
        template: 'index',//this is the template of your hbs file
  };


    // const opcionesEmail = {
    //     from:'devJobs <no-reply@uptask.com>',
    //     to: opciones.usuario.email,
    //     subject : opciones.subject, 
    //     template: opciones.archivo,
    //     context: {
    //         resetUrl : opciones.resetUrl
    //     },
    // };
    transport.sendMail(mailOptions);
    // const sendMail = util.promisify(transport.sendMail, transport);
    // return sendMail.call(transport, mailOptions);
}

