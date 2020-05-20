'use strict'

const axios = require("axios").default;
const globalUrl = "https://api.hubapi.com/deals/v1/deal";
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const hapiKey = "?hapikey="+`${process.env.HAPIKEY}`;

const dealController = {

    store: async(request) => { 
        try{

            var userData = {
                "associations": {
                    "associatedCompanyIds": [],
                    "associatedVids": [
                        284701
                    ]
                  },
                "properties": [
                    {
                        "value": request.idDistrito + " "+ request.name + " " + request.lastName,
                        "name": "dealname"
                    },
                    {
                        "value": request.email,
                        "name": "email"
                    },
                    {
                        "value": request.phone,
                        "name": "celular"
                    },
                    {
                        "value" : process.env.DATE_HUB,
                        "name": "dealstage" 
                    }
                ]
            };
            
            const {data} = await axios.post(globalUrl + hapiKey, userData, 
            {
                headers: {
                    'content-type': 'application/json',
                }
            });

            return data;

        }
        catch(error){
            console.log(error);
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

}

module.exports = dealController;