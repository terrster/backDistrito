'use strict'

const mailManager = require("../services/mailManager");

const landingController = {
    contact: async(request, response) => {
        try{
            await mailManager.contact(request.body);

            return response.json({ 
                code: 200,
                msg: 'Correo enviado exitosamente' 
            });
        }
        catch(error){
            return response.json({ 
                code: 500,
                msg: `Ocurrió un error al tratar de enviar un correo`
            });
        }
    }
}

module.exports = landingController;