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
    },
    reactivate: async(request) => {

        let recipients = [
            'mayrarocha@distritopyme.com', 
            'luistirador@distritopyme.com', 
            'roayala@distritopyme.com'
        ];

        let mailOptions = {
            from: 'Distrito Pyme <contacto@distritopyme.com>',
            to: recipients,
            subject: 'Un usuario intentó reactivar su cuenta',
            html: templates.reactivate(request)
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de reactivación enviado correctamente!"
            }
        }
        catch(error){console.log(error)
            return {
                code: 500,
                msg: "No se pudo enviar el correo de reactivación"
            }
        }
    },
    notify: async(request) => {

        let recipients = [
            'mayrarocha@distritopyme.com', 
            'javieruribe@impmx.com', 
            'roayala@distritopyme.com'
        ];

        let mailOptions = {
            from: 'Distrito Pyme <contacto@distritopyme.com>',
            to: recipients,
            subject: request.subject,
            html: templates.notify(request.message)
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de reactivación enviado correctamente!"
            }
        }
        catch(error){console.log(error)
            return {
                code: 500,
                msg: "No se pudo enviar el correo de reactivación"
            }
        }
    },
    sendToTI: async(request) => {
        let mailOptions = {
            from: 'Distrito Pyme <contacto@distritopyme.com>',
            to: request.to,
            subject: request.subject,
            html: templates.notify(request.message)
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de notificación enviado correctamente a TI!"
            }
        }
        catch(error){console.log(error)
            return {
                code: 500,
                msg: "No se pudo enviar el correo de notificación"
            }
        }
    },
    contact: async(request) => {
        let recipients = [
            'luistirador@distritopyme.com', 
            'contacto@distritopyme.com',
            'miguelwayas@distritopyme.com'
        ];

        let mailOptions = {
            from: 'Distrito Pyme <contacto@distritopyme.com>',
            to: recipients,
            subject: "Formulario Contáctanos",
            html: `
                <p>Hola equipo, este es un mensaje desde el formulario de contacto.</p>
                <p><strong>${request.name}</strong> con el email <strong>${request.email}</strong> escribi&oacute;:</p>
                <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic;"><strong>${request.message}</strong></p>
            `
        };

        try{
            await service.sendMail(mailOptions);
            
            return {
                code: 200,
                msg: "Correo de reactivación enviado correctamente!"
            }
        }
        catch(error){console.log(error)
            return {
                code: 500,
                msg: "No se pudo enviar el correo de reactivación"
            }
        }
    } 
}

module.exports = mailManager;