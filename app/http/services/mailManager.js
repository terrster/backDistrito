'use strict'

const nodemailer = require('nodemailer');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

const templates = require("../../../public/email/templates");

const service = nodemailer.createTransport({
    name : process.env.MAIL_NAME,
    host : process.env.MAIL_HOST,
    port : parseInt(process.env.MAIL_PORT),
    //ignoreTLS: (process.env.MAIL_IGNORE_TLS === 'true' ? true : false),
    secure : (process.env.MAIL_SECURE === 'true' ? true : false),
    tls : { rejectUnauthorized: (process.env.MAIL_REJECTUNAUTHORIZED === 'true' ? true : false) },
    auth: {
      user: "",
      pass: ""
    }
});

const mailManager = {

    forgot_password: async(request) => {
        let { email, hash } = request;
        let url = `${process.env.LINK_PASSWORD}`+hash;
        let mailOptions = {
            from: '',
            to: email,
            subject: 'Distrito Pyme: Recuperación de contraseña',
            html: templates.reset_password(url)
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de recuperación enviado exitosamente"
            }
        }
        catch(error){
            return {
                code: 500,
                msg: "No se pudo enviar el correo de recuperación"
            }
        }
    }

}

module.exports = mailManager;