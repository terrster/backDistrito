'use strict'

const fs = require('fs');
const path = require("path");

const reset_password = (url) => {
 
    // let html = fs.readFileSync(path.resolve("public/email/email_password.html"), 'utf8');
    // let format = html.replace(/{url}/g, url);
    
    // return format;
    return `
    <!DOCTYPE html>
    <html>
    <head>

    <meta charset="utf-8">
    <title>Password Reset</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" media="screen" href="https://fontlibrary.org/face/metropolis" type="text/css"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    </head>
    <body style="box-sizing: border-box;">
    <div style="background-color: #F7F7F7;">
        <p style="font-family: 'MetropolisRegular'; color:#000000;">Para iniciar con el proceso de recuperación de contraseña haz click en el siguiente enlace:</p>
        <p style="font-family: 'MetropolisSemibold'; color:#003C98;"><a href="${url}">Recuperar Contraseña</a></p>
        <p style="font-family: 'MetropolisSemibold'; color:#090941;">Distrito Pyme <br>#ComunidadDeCrédito</p>
    </div>
    </body>
    </html>
    `;
}

const reactivate = ({idDistrito, nombre, telefono, email}) => {
 
    // let html = fs.readFileSync(path.resolve("public/email/email_password.html"), 'utf8');
    // let format = html.replace(/{url}/g, url);
    
    // return format;
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" media="screen" href="https://fontlibrary.org/face/metropolis" type="text/css"/>
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
    </head>
    <body style="box-sizing: border-box;">
        <div>
            ${process.env.APP_ENV === 'local' || process.env.APP_ENV === 'dev' ? '<p><strong>Este es un correo enviado desde el entorno de desarrollo</strong></p>' : ''}
            <p style="font-family: 'MetropolisRegular'; color:#000000;">Un usuario intentó reactivar su cuenta desde la página de Distrito Pyme, aquí tienes sus datos:</p>
            <p style="font-family: 'MetropolisRegular'; color:#000000;"><strong>Id Distrito:</strong> ${idDistrito}</p>
            <p style="font-family: 'MetropolisSemibold'; color:#000000;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="font-family: 'MetropolisSemibold'; color:#000000;"><strong>Teléfono:</strong> ${telefono}</p>
            <p style="font-family: 'MetropolisSemibold'; color:#000000;"><strong>Correo:</strong> ${email}</p>
        </div>
    </body>
    </html>
    `;
}

module.exports = {
    reset_password,
    reactivate
}