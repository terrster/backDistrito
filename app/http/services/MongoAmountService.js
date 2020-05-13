'use strict'

const Amount = require('../models/Amount');

class MongoAmountService {

    static getAmount(idClient){

        try{

            const showAmount = async() => {
                const amount = await Amount.find({ idClient: `${idClient}`});
                return amount;
            }

            return showAmount();

        }
        catch(error){
            console.log(error);
            return null;
        }
    }

    static storeAmount(idClient, request){
        
        try{

            const newAmount = async() => {

                const amount = new Amount();
                amount.idClient = {
                    _id : idClient
                }
                amount.howMuch = request.howMuch;
                amount.whyNeed = request.whyNeed;
                amount.whenNeed = request.whenNeed;
                amount.term = request.term;
                amount.yearSales = request.yearSales;
                amount.old = request.old;
                amount.status = true;

                let amountStored = await amount.save();
                //console.log(userStored);
                return amountStored;
            }

            return newAmount();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static updateAmount(id, request){
        
        try{

            const editAmount = async() => {
                let amountUpdated = await Amount.findByIdAndUpdate(id, request);
                return amountUpdated;
            }

            return editAmount();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

}

module.exports = { MongoAmountService };