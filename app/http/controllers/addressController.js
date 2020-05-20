'use strict'

const Address = require("../models/Address");

const addressController = {

    store: async(request) => {
        try{
            let addressStored = await Address.create(request);
            return addressStored;
        }
        catch(error){
            console.log(error);
        }
    },
    update: async(id, request) => {
        try{
            let addressUpdated = await Address.findByIdAndUpdate(id, request);
            return addressUpdated;
        }
        catch(error){
            console.log(error);
        }
    }

}

module.exports = addressController;