'use strict'

const axios = require("axios");
const { response } = require("express");
const mailManager = require("../services/mailManager");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const format = require("../services/formatManager");
const jwt = require("jsonwebtoken");

// #Hubspot - ImpulsoMx
const hubspotImpMx = {
    baseURL: 'https://api.hubapi.com/',
    pipeline: '1849306',
    dealstage: '2753634',
    hapiKey: '?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3',
    prefix: process.env.APP_ENV == 'local' || process.env.APP_ENV == 'dev' ? 'FormImpulsoDev' : 'FormImpulso'
};

const getContactByEmail = async(email) => {
    try{
        const response = await axios.get(hubspotImpMx.baseURL + 'contacts/v1/contact/email/' + email + '/profile' + hubspotImpMx.hapiKey);

        if(response.status == 200){
            return response.data;
        }
    }
    catch(error){
        return null;
    }
}

const storeContact = async(request) => {
    try{
        let contactParams = {
            "properties": [
                {
                    "value": request.email.toLowerCase(),
                    "property": "email"
                },
                {
                    "value": request.phone,
                    "property": "mobilephone"
                },
                {
                    "value": request.name,
                    "property": "firstname"
                },
                {
                    "value": request.lastname,
                    "property": "lastname"
                }
            ]
        };

        const {data} = await axios.post(hubspotImpMx.baseURL + 'contacts/v1/contact' + hubspotImpMx.hapiKey, contactParams);
        return data;
    }
    catch(error){
        let response = {
            msg: "Hubspot: Algo salió mal tratando de crear un contact",
            error: error
        };

        // console.log(response);
        return response;
    }
}

const getDealById = async(id) => {
    try{
        const data = await axios.get(hubspotImpMx.baseURL + 'deals/v1/deal/' + id + hubspotImpMx.hapiKey);
        return data;
    }
    catch(error){
        return error;
    }
}

const storeDeal = async(request) => { 
    try{
        let dealParams = {
            "associations": {
                "associatedVids": [
                    request.hubspotContactId,
                ],
            },
            "properties": [
                //Información del negocio
                {
                    "value": hubspotImpMx.prefix + " - " + request.personal.name.trim() + " " + request.personal.lastname.trim(),
                    "name": "dealname"
                },
                //1. Registro
                {
                    "value": request.personal.name.trim() + " " + request.personal.lastname.trim(),
                    "name": "nombre_comercial"
                },
                {
                    "value": request.business.email.toLowerCase(),
                    "name": "email"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "celular"
                },
                //2. Monto
                {
                    "value": format.PERSON_TYPE[request.business.taxRegime],
                    "name": "tipo_de_persona"
                },
                {
                    "value": request.business.howMuch,
                    "name": "amount"
                },
                {
                    "value": request.business.anualSales,
                    "name": "n2_5_ventas_anuales"
                },
                //3. Comercial
                {
                    "value": request.business.businessName.trim(),
                    "name": "n3_nombre_comercial"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "telefono"
                },
                //4. Generales
                {
                    "value": request.personal.name.trim(),
                    "name": "n4_1_nombre"
                },
                {
                    "value": request.personal.lastname.trim(),
                    "name": "n4_2_apellido_paterno"
                },
                {
                    "value": request.personal.secondLastName.trim(),
                    "name": "n4_3_apellido_materno"
                },
                {
                    "value": request.personal.birthDate,
                    "name": "n4_5_fecha_de_nacimiento"
                },
                {
                    "value": request.personal.street.trim(),
                    "name": "n4_6_calle"
                },
                {
                    "value": request.personal.number.trim(),
                    "name": "n4_7_num_ext"
                },
                {
                    "value": request.personal.zipCode,
                    "name": "n4_9_c_p_"
                },
                {
                    "value": request.personal.suburb,
                    "name": "n4_91_colonia"
                },
                {
                    "value": request.personal.state,
                    "name": "estado_de_la_rep_de_la_persona"
                },
                {
                    "value": request.personal.city,
                    "name": "municipio_de_la_persona"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "n4_92_tel_fono"
                },
                {
                    "value": hubspotImpMx.dealstage,
                    "name": "dealstage" 
                }
            ]
        };

        const {data} = await axios.post(hubspotImpMx.baseURL + 'deals/v1/deal' + hubspotImpMx.hapiKey, dealParams);
        return data;
    }
    catch(error){
        let response = {
            code: 500,
            msg: "Hubspot: Algo salió mal tratando de crear un deal",
            error: error
        };

        return response;
    }
}

const updateDeal = async(request) => { 
    try{
        let dealParams = {
            "properties": [
                //Información del negocio
                {
                    "value": hubspotImpMx.prefix + " - " + request.personal.name.trim() + " " + request.personal.lastname.trim(),
                    "name": "dealname"
                },
                //1. Registro
                {
                    "value": request.personal.name.trim() + " " + request.personal.lastname.trim(),
                    "name": "nombre_comercial"
                },
                {
                    "value": request.business.email.toLowerCase(),
                    "name": "email"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "celular"
                },
                //2. Monto
                {
                    "value": format.PERSON_TYPE[request.business.taxRegime],
                    "name": "tipo_de_persona"
                },
                {
                    "value": request.business.howMuch,
                    "name": "amount"
                },
                {
                    "value": request.business.anualSales,
                    "name": "n2_5_ventas_anuales"
                },
                //3. Comercial
                {
                    "value": request.business.businessName.trim(),
                    "name": "n3_nombre_comercial"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "telefono"
                },
                //4. Generales
                {
                    "value": request.personal.name.trim(),
                    "name": "n4_1_nombre"
                },
                {
                    "value": request.personal.lastname.trim(),
                    "name": "n4_2_apellido_paterno"
                },
                {
                    "value": request.personal.secondLastName.trim(),
                    "name": "n4_3_apellido_materno"
                },
                {
                    "value": request.personal.birthDate,
                    "name": "n4_5_fecha_de_nacimiento"
                },
                {
                    "value": request.personal.street.trim(),
                    "name": "n4_6_calle"
                },
                {
                    "value": request.personal.number.trim(),
                    "name": "n4_7_num_ext"
                },
                {
                    "value": request.personal.zipCode,
                    "name": "n4_9_c_p_"
                },
                {
                    "value": request.personal.suburb,
                    "name": "n4_91_colonia"
                },
                {
                    "value": request.personal.state,
                    "name": "estado_de_la_rep_de_la_persona"
                },
                {
                    "value": request.personal.city,
                    "name": "municipio_de_la_persona"
                },
                {
                    "value": request.business.whatsApp,
                    "name": "n4_92_tel_fono"
                }
            ]
        };

        const {data} = await axios.put(hubspotImpMx.baseURL + 'deals/v1/deal/' + request.hubspotDealId + hubspotImpMx.hapiKey, dealParams);
        return data;
    }
    catch(error){
        let response = {
            code: 500,
            msg: "Hubspot: Algo salió mal tratando de crear un deal",
            error: error
        };

        return response;
    }
}

const impulsoMxController = {
    show: async(request, response) => {
        let hubspot = await getDealById(request.params.id);
        
        if(hubspot.hasOwnProperty('response') && hubspot.response.status == 404){
            return response.json({ 
                status: 404, 
                message: 'El deal no existe.'
            });
        }
        else if(hubspot.status == 200){
            let dealEncrypt = await jwt.sign(hubspot.data.properties, 'impmx2020');

            return response.json({ 
                status: 200, 
                deal: dealEncrypt
            });
        }
        else{
            return response.json({ 
                status: hubspot.response.status, 
                message: "Ha ocurrido un error tratando de obtener el deal."
            });
        }
    },
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
            }).then(response => {
                if(response.data.success == false && response.data.code == 'sms_07'){
                    let data = {
                        subject: 'ImpulsoMx - SMSMASIVOS',
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
            
            let securityCodeEncrypt = await jwt.sign({code: securityCode}, 'impmx2020');

            return response.json({
                status: 200,
                msg: "Código de autenticación generado exitosamente.",
                payload: securityCodeEncrypt
            });
        }
        catch(error){
            return response.json({
                status: 400,
                msg: "Ha ocurrido un error al generar el código de autenticación."
            });
        }
    },
    store: async(request, response) => {
        let data = request.body;

        let contactExist = await getContactByEmail(data.business.email.toLowerCase());

        if(contactExist){
            return response.json({ 
                code: 500,
                msg: "El correo electrónico ya existe"
            });
        }

        let contactStored = await storeContact(data);
        data.hubspotContactId = contactStored.vid;

        let dealStored = await storeDeal(data);

        if(dealStored.code == 403){
            return response.json(dealStored);
        }

        return response.json({ 
            code: 200, 
            msg: "Deal registrado exitosamente"
        });
    },
    update: async(request, response) => {
        let data = request.body;

        let dealUpdated = await updateDeal(data);

        if(dealUpdated.code == 403){
            return response.json(dealUpdated);
        }

        return response.json({ 
            code: 200, 
            msg: "Deal actualizado exitosamente"
        });
    }
};

module.exports = impulsoMxController; 