'user strict'

const { HubspotService } = require("../services/HubspotService");
const { MongoUserService } = require("../services/MongoUserService");
const { MongoAmountService } = require("../services/MongoAmountService");
const { MongoApplianceService } = require("../services/MongoApplianceService");

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

var amountController = {

    getAmount: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;
        
        let user = await MongoUserService.getUser(id);
        //console.log(user);

        if(user.idClient != ""){//Get amount info
           let amount = await MongoAmountService.getAmount(user.idClient[0]);
           //console.log(amount);
           return response.status(200).send(amount);
        }

        return response.status(200).send(null);
    },
    storeOrUpdateAmount: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;
        
        let user = await MongoUserService.getFullUser(id);
        let amount = await MongoAmountService.getAmount(user.idClient[0]);

        if(amount == ""){//Create
            const { howMuch, whyNeed, whenNeed, term, yearSales, status} = request;
            const amountParams = {
                howMuch,
                whyNeed,
                whenNeed,
                term,
                yearSales,
                status
            };
            let amountStored = await MongoAmountService.storeAmount(user.idClient[0], amountParams);

            if(user.idClient[0].appliance == ""){//Este appliance está en duda, está confuso
                let applianceStored = await MongoApplianceService.storeAppliance({
                    idGeneralInfo : {
                        _id : infoStored._id
                    }
                });
            }
            return amountStored;
        }
        else{//Edit
            const { howMuch, whyNeed, whenNeed, term, yearSales, status} = request;
            const amountParams = {
                howMuch,
                whyNeed,
                whenNeed,
                term,
                yearSales,
                status
            };
            let amountUpdated = await MongoAmountService.updateAmount(amount._id, amountParams);
            return amountUpdated;
        }
    }

}

module.exports = amountController;