'use strict'

const axios = require("axios").default;
const globalUrl = "https://api.hubapi.com/deals/v1/deal";
const hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";

class HubspotService {

    static storeDeal(request){

        try{

            const newDeal = async() => {
                const {data} = await axios.post(globalUrl + hapiKey, request.body)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
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