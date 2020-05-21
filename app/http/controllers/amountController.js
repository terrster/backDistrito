'user strict'

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
                whenNeed, 
                term, 
                yearSales
            } = request.body;
            let amountParams = {
                howMuch,
                whyNeed,
                whenNeed,
                term,
                yearSales
            };
            amountParams.push({
                idClient: {
                    _id: user.idClient[0]._id
                },
                status : true
            });

            let amountStored = await Amount.create(amountParams);

            let applianceStored = await Appliance.create({
                idClient: {
                    _id: user.idClient[0]._id
                },
                idAmount : {
                    _id : amountStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id, {
                appliance: {
                    _id: applianceStored._id
                }
            });

            return response.json({ 
                code: 200,
                msg: "Información de monto guardada exitosamente",
                amount: amountStored 
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

        try{
            let { 
                howMuch, 
                whyNeed, 
                whenNeed, 
                term, 
                yearSales
            } = request.body;
            let amountParams = {
                howMuch,
                whyNeed,
                whenNeed,
                term,
                yearSales
            };

            let amountUpdated = await Amount.findByIdAndUpdate(id, amountParams);

            return response.json({ 
                code: 200,
                msg: "Información de monto actualizada exitosamente",
                amount: amountUpdated
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