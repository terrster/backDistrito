'use strict'

const _axios = require("axios").default;
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN; // Your Hubspot Token
const axios = _axios.create({
    baseURL: 'https://api.hubapi.com/',
    headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

const hubspot = {
    pipeline: '6589064',// Brokers DP
    dealstage: '6589065',// Formulario/Prospecto
    ownerId: '51604012',// Thalia Choreño
}

const getContactByEmail = async(email) => {
    try{
        const response = await axios.get('contacts/v1/contact/email/' + email + '/profile');

        if(response.status == 200){
            return response.data;
        }
    }
    catch(error){
        return null;
    }
}

const storeContact = async(request) => {
    console.log(request);
    try{
        let contactParams = {
            "properties": [
                {
                    "value": request.name,
                    "property": "firstname"
                },
                {
                    "value": request.email,
                    "property": "email"
                },
                {
                    "value": request.mobilephone,
                    "property": "phone"
                },
                {
                    "value": request.mobilephone,
                    "property": "mobilephone"
                },
                {
                    "value": request.message,
                    "property": "message"
                }
            ]
        }

        const {data} = await axios.post('contacts/v1/contact', contactParams);
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

const brokerController = {
    store: async(request, response) => {
        try{
            let data = request.body;
            let canal;
            if(data.canal){
                switch(data.canal){
                    case 'pyme-brokers-campaña':
                        canal = 'campañabrokersdp';
                        break;
                    case 'pyme-brokers':
                        canal = 'onlinepyme';
                        break;
                    case 'Campaña Julio 2022':
                        canal = 'campañabrokersdc';
                        break;
                    case 'brokers-crediexpo':
                        canal = 'crediexpo';
                        break;
                    default:
                        canal = data.canal;
                        break;
                }
            } else {
                canal = "onlinecasa";
            }
            let exist = await getContactByEmail(data.email);

            if(exist){
                if(process.env.NODE_ENV !== 'production'){
                    let deleteContact = await axios.delete('contacts/v1/contact/vid/' + exist.vid);
                }
                return response.json({ 
                    code: 500,
                    msg: "El correo electrónico ya existe"
                });
            }

            let contact = await storeContact(data);

            let dealParams = {
                "associations": {
                    "associatedVids": [
                        contact.vid
                    ],
                },
                "properties": [
                    {
                        "value": data.prefix ? data.prefix + " " + data.name.trim() : data.name.trim(),
                        "name": "dealname"
                    },
                    {
                        "value": canal,
                        "name": "canal_de_entrada"
                    },
                    {
                        "value": data.name.trim(),
                        "name": "nombre_comercial"
                    },
                    {
                        "value": data.email.trim(),
                        "name": "email"
                    },
                    {
                        "value": data.mobilephone,
                        "name": "telefono"
                    },
                    {
                        "value": data.name.trim(),
                        "name": "n4_1_nombre"
                    },
                    {
                        "value": data.zip,
                        "name": "n4_9_c_p_"
                    },
                    {
                        "value": data.message,
                        "name": "n9_1_01_experiencia_y_descripcion"
                    },
                    {
                        "value": hubspot.dealstage,
                        "name": "dealstage" 
                    },
                    {
                        "value": hubspot.pipeline,
                        "name": "pipeline"
                    },
                    {
                        "value": hubspot.ownerId,
                        "name": "hubspot_owner_id"
                    }
                ]
            }

            await axios.post('deals/v1/deal', dealParams);
            
            return response.json({ 
                code: 200,
                msg: 'Broker dado de alta exitosamente' 
            });

        }
        catch(error){
            console.log(error);
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de dar de alta un broker",
                error: error
            });
        }
    }
}

module.exports = brokerController;
