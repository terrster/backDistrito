'use strict'

const axios = require("axios");
const mailManager = require("../services/mailManager");

const smsController = {
    internalNotify: async(request, response) => {
        try{
            let {msg} = request.body;

            await axios.post('https://api.smsmasivos.com.mx/sms/send', {
                message: msg,
                numbers: '5568781567, 5615139382',
                country_code: '52'
            }, {
                headers: {
                    'apikey' : 'b73f03ab8fdc7b6ecd1e215e8ad1a583c35e9d94'
                }
            }).then(response => {
                if(response.data.success == false && response.data.code == 'sms_07'){
                    let data = {
                        subject: 'SMSMASIVOS',
                        message: 'Créditos insuficientes. Actualmente cuentas con 0 créditos.',
                    }

                    const Notify = async(data) => {
                        await mailManager.notify(data);
                    }

                    Notify(data);
                }
                else if(response.data.success == false && response.data.code == 'sms_03'){
                    console.log(response.data);
                }
            });

            return response.json({
                status: 200,
                msg: "Envió de notificación interna realizado exitosamente"
            });
        }
        catch(error){
            return response.json({
                status: 400,
                msg: "Ha ocurrido un error al enviar la notificación interna"
            });
        }
    },
    externalNotify: async(request, response) => {
        try{
            let {numbers, msg} = request.body;

            await axios.post('https://api.smsmasivos.com.mx/sms/send', {
                message: msg,
                numbers: numbers,
                country_code: '52'
            }, {
                headers: {
                    'apikey' : 'b73f03ab8fdc7b6ecd1e215e8ad1a583c35e9d94'
                }
            }).then(response => {
                if(response.data.success == false && response.data.code == 'sms_07'){
                    let data = {
                        subject: 'SMSMASIVOS',
                        message: 'Créditos insuficientes. Actualmente cuentas con 0 créditos.',
                    }

                    const Notify = async(data) => {
                        await mailManager.notify(data);
                    }

                    Notify(data);
                }
                else if(response.data.success == false && response.data.code == 'sms_03'){
                    console.log(response.data);
                }
            });

            return response.json({
                status: 200,
                msg: "Envió de notificación interna realizado exitosamente"
            });
        }
        catch(error){
            return response.json({
                status: 400,
                msg: "Ha ocurrido un error al enviar la notificación interna"
            });
        }
    }
}

module.exports = smsController; 