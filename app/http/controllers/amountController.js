'user strict'

const hubspotController = require("../controllers/hubspotController");
const User = require("../models/User");
const Amount = require("../models/Amount");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const amountController = {

    store: async(request, response) => {
        let id = request.params.id;//id de user

        try{
            let user = await User.findById(id);

            let { 
                howMuch, 
                whyNeed,
                whyNeedDetails, 
                whenNeed, 
                term, 
                yearSales,
                old
            } = request.body;

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'amount', { 
                    howMuch, 
                    whyNeed,
                    whyNeedDetails, 
                    whenNeed, 
                    term, 
                    yearSales,
                    old
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de guardar información | Hubspot: amount",
                        error: dealUpdated.error
                    });
                }
             }
             else{
                 return response.json({
                     code: 500,
                     msg: "Algo salió mal tratando de guardar información | Hubspot: amount"
                 });
             }

            let amountParams = {
                howMuch,
                whyNeed,
                whyNeedDetails,
                whenNeed,
                term,
                yearSales,
                old,
                idClient: {
                    _id: user.idClient._id
                },
                status : true
            };

            let amountStored = await Amount.create(amountParams);

            let applianceStored = await Appliance.create({
                idClient: {
                    _id: user.idClient._id
                },
                idAmount : {
                    _id : amountStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient._id, {
                appliance: {
                    _id: applianceStored._id
                }
            });

            user = await User.findById(id);

            return response.json({ 
                code: 200,
                msg: "Información de monto guardada exitosamente",
                user: user 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de guardar la información de monto",
                error: error
            });
        }
    },
    show: async(request, response) => {
        let id = request.params.id;//id de amount

        try{
            let amount = await Amount.findById(id);

            return response.json({ 
                code: 200,
                amount: amount 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información de monto",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;//id de amount
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let { 
                howMuch, 
                whyNeed,
                whyNeedDetails, 
                whenNeed, 
                term, 
                yearSales,
                old
            } = request.body;
            
            let _user = await User.findById(idUser);
            if(_user){
                let dealUpdated = await hubspotController.deal.update(_user.hubspotDealId, 'amount', { 
                    howMuch, 
                    whyNeed,
                    whyNeedDetails, 
                    whenNeed, 
                    term, 
                    yearSales,
                    old
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: amount",
                        error: dealUpdated.error
                    });
                }
             }
             else{
                 return response.json({
                     code: 500,
                     msg: "Algo salió mal tratando de actualizar información | Hubspot: amount"
                 });
             }

            let amountParams = {
                howMuch,
                whyNeed,
                whyNeedDetails,
                whenNeed,
                term,
                yearSales,
                old
            };

            await Amount.findByIdAndUpdate(id, amountParams);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Información de monto actualizada exitosamente",
                user: user
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la información de monto",
                error: error
            });
        }
    }
}

module.exports = amountController;
