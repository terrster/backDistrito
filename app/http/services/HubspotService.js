'use strict'

const axios = require("axios").default;

class HubspotService {

    globalUrl = "https://api.hubapi.com/deals/v1/deal";
    hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";

    storeDeal(request){

        axios.post(this.globalUrl + this.hapiKey, request.body)
        .then((response) => {

        })
        .catch((error) => {

        });
        
    }

    getDeal(request){
        axios.get(this.globalUrl + "/" + request.dealId + this.hapiKey)
        .then((response) => {

        })
        .catch((error) => {

        });
    }

    updateDeal(request){
        axios.put(this.globalUrl + "/" + request.params.dealId + this.hapiKey, request.body)
        .then((response) => {

        })
        .catch((error) => {

        });
    }

    deleteDeal(request, response){
        axios.delete(this.globalUrl + "/" + request.params.dealId + this.hapiKey)
        .then((response) => {

        })
        .catch((error) => {

        });
    }

}

module.exports = HubspotService;