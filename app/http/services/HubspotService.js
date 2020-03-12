'use strict'

const axios = require("axios").default;
const globalUrl = "https://api.hubapi.com/deals/v1/deal";
const hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";

class HubspotService {

    static getAllDeals(request) {

        try {

            const deals = async() => {
                const {data} = await axios.get("https://api.hubapi.com/deals/v1/deal/paged?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3&includeAssociations=true&limit=2&properties=dealname")
                .then((response) => {
                    return response;
                })
                .catch((error) => {
    
                });

                return data;
            }

            return deals();

        }
        catch (error) {
            console.log(error);
        }

    }

    async storeDeal(request){

        try{

            const newDeal = async() => {
                const {data} = await axios.post(globalUrl + hapiKey, request.body)
                .then((response) => {
    
                })
                .catch((error) => {
    
                });
            }

        }
        catch(error){

        }
        

    }

    async getDeal(request){
        
        try{

            axios.get(globalUrl + "/" + request.dealId + hapiKey)
            .then((response) => {

            })
            .catch((error) => {

            });

        }
        catch(error){

        }
        
    }

    async updateDeal(request){
        
        try{

            axios.put(globalUrl + "/" + request.params.dealId + hapiKey, request.body)
            .then((response) => {

            })
            .catch((error) => {

            });

        }
        catch(error){

        }
        
    }

    async deleteDeal(request, response){
        
        try{

            axios.delete(globalUrl + "/" + request.params.dealId + hapiKey)
            .then((response) => {

            })
            .catch((error) => {

            });

        }
        catch(error){

        }
        
    }

}

module.exports = { HubspotService };