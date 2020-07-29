'use strict'

const nodemailer = require('nodemailer');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

const templates = require("../../../public/email/templates");

const service = nodemailer.createTransport({
    service: "Outlook365",
    auth: {
      user: "contacto@distritopyme.com",
      pass: "Clientes2020"
    },
    secureConnection: false
});

const mailManager = {

    forgot_password: async(request) => {
        let { email, hash } = request;
        let url = `${process.env.LINK_PASSWORD}`+hash;
        let mailOptions = {
            from: 'Distrito Pyme <contacto@distritopyme.com>',
            to: email,
            subject: 'Recuperación de contraseña',
            html: templates.reset_password(url)
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de recuperación enviado exitosamente"
            }
        }
        catch(error){console.log(error)
            return {
                code: 500,
                msg: "No se pudo enviar el correo de recuperación"
            }
        }
    }

}

module.exports = mailManager;