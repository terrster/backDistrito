'use strict'

const Reference = require("../models/Reference");

const referenceController = {

    store: async(request) => {
        try{
            let referenceStored = await Reference.create(request);
            return referenceStored;
        }
        catch(error){
            console.log(error);
        }
    },
    update: async(id, request) => {
        try{
            let referenceUpdated = await Reference.findByIdAndUpdate(id, request);
            return referenceUpdated;
        }
        catch(error){
            console.log(error);
        }
    }

}

module.exports = referenceController;