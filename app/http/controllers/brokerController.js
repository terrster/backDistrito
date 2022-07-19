'use strict'

const axios = require("axios");

const hubspot = {
    baseURL: 'https://api.hubapi.com/',
    pipeline: '6589064',// Brokers DP
    dealstage: '6589065',// Formulario/Prospecto
    ownerId: '51604012',// Thalia Choreño
    hapiKey: '?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3'
}

const getContactByEmail = async(email) => {
    try{
        const response = await axios.get(hubspot.baseURL + 'contacts/v1/contact/email/' + email + '/profile' + hubspot.hapiKey);

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

        const {data} = await axios.post(hubspot.baseURL + 'contacts/v1/contact' + hubspot.hapiKey, contactParams);
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
                    default:
                        canal = 'onlinecasa';
                        break;
                }
            } else {
                canal = "onlinecasa";
            }
            let exist = await getContactByEmail(data.email);

            if(exist){
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
                        "value": data.name.trim(),
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

            await axios.post(hubspot.baseURL + 'deals/v1/deal' + hubspot.hapiKey, dealParams);
            
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
