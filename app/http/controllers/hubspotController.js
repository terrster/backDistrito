'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'http://api.hubapi.com/',
    headers: {
        'content-type': 'application/json'
    }
});
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";

const deal = {

    store: async(request) => { 
        try{

            let dealParams = {
                "properties": [
                    {
                        "value": request.idDistrito,
                        "name": "numeroderegistro"
                    },
                    {
                        "value": request.name + " " + request.lastName,
                        "name": "nombre_comercial"
                    },
                    {
                        "value": request.phone,
                        "name": "celular"
                    },
                    {
                        "value": request.idDistrito + " "+ request.name + " " + request.lastName,
                        "name": "dealname"
                    },
                    {
                        "value" : process.env.DATE_HUB,
                        "name": "dealstage" 
                    },
                ]
            };console.log(dealParams);
            
            //const {data} = await axios.post('deals/v1/deal' + hapiKey, dealParams);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de crear un deal",
                error: error
            });
        }
    },
    show: async(request) => {
        try{
            const {data} = await axios.get(globalUrl + "/" + request.id + hapiKey);
            
            return data;
        }
        catch(error){
            console.log(error);
        }
    },
    update: async(request) => {
        try{
            const {data} = await axios.put(globalUrl + "/" + request.params.id + hapiKey, request.body);
            
            return data;

        }
        catch(error){
            console.log(error);
        }
    }

};

const contact = {

    store: async(request) =>{
        try{
            let contactParams = {
                "properties": [
                    {
                        "value": request.email,
                        "name": "email"
                    },
                    {
                        "value": request.phone,
                        "name": "mobilephone"
                    },
                    {
                        "value": request.name,
                        "name": "firstname"
                    },
                    {
                        "value" : process.env.DATE_HUB,
                        "name": "dealstage" 
                    },
                ]
            };

            const {data} = await axios.post('contacts/v1/contact' + hapiKey, dealParams);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de crear un contacto",
                error: error
            });
        }
    }

};

const amount = {

};

const comercialInfo = {

};

const generalInfo = {

};

const reference = {

};

const documents = {

};

module.exports = {
    deal,
    contact,
    amount,
    comercialInfo,
    generalInfo,
    reference,
    documents
};