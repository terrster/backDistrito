'use strict'

const axios = require("axios").default;
const globalUrl = "https://api.hubapi.com/deals/v1/deal";
const hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

class HubspotService {

    static storeDeal(request){

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
                        "value": request.name + " " + request.lastname,
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

            //console.log(userData);
            

           // axios.post(globalUrl + hapiKey, userData);
            // .then(function (response) {
            //     //console.log(response);
            //   })
            //   .catch(function (error) {
            //     //console.log(error);
            //   });
            
            const newDeal = async() => {
                const {data} = await axios.post(globalUrl + hapiKey, userData, 
                {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                .then((response) => {console.log(response);
                    return response;
                })
                .catch((error) => {console.log(error);
                    return error;
                });

                return data;
            }

            return newDeal();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
        

    }

    static getDeal(request){
        
        try{

            const deal = async() => {
                const {data} = await axios.get(globalUrl + "/" + request.id + hapiKey)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    return error;
                });

                return data;
            }

            return deal();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
        
    }

    static updateDeal(request){
        
        try{

            const editDeal = async() => {
                const {data} = await axios.put(globalUrl + "/" + request.params.id + hapiKey, request.body)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    return error;
                });

                return data;
            }

            return editDeal();      

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obetner la información"
            };
        }
        
    }

    static deleteDeal(request){
        
        try{

            const delDeal = async() => {
                const {data} = await axios.delete(globalUrl + "/" + request.id + hapiKey)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    return error;
                });

                return data;
            }

            return delDeal();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
        
    }

}

module.exports = { HubspotService };