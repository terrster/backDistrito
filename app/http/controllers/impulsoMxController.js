'use strict'

const axios = require("axios");

const impulsoMxController = {
    getSecurityCode: async(request, response) => {
        let req = request.body;
        let securityCode = Math.floor(100000 + Math.random() * 900000);

        try{
            await axios.post('https://api.smsmasivos.com.mx/sms/send', {
                message: 'Hola. Te damos la bienvenida a ImpulsoMx. Tu codigo de autenticacion es: ' + securityCode,
                numbers: req.number,
                country_code: '52'
            }, {
                headers: {
                    'apikey' : 'b73f03ab8fdc7b6ecd1e215e8ad1a583c35e9d94'
                }
            })//.then(response => console.log(response.data));
            
            return response.json({
                status: 200,
                msg: "Código de autenticación generado exitosamente.",
                code: securityCode
            });
        }
        catch(error){
            return response.json({
                status: 400,
                msg: "Ha ocurrido un error al generar el código de autenticación."
            });
        }
    }
};

module.exports = impulsoMxController; 