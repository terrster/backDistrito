'use strict'

const Appliance = require('../models/Appliance');

class MongoApplianceService {

    static getAppliance(id){

        try{

            const showAppliance = async() => {

                let appliance = await Appliance.findById(id);
                return appliance;
            }

            return showAppliance();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static storeAppliance(request){

        try{

            const createAppliance = async() => {

                let applianceStored = await Appliance.create(request);
                return applianceStored;
            }

            return createAppliance();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static updateAppliance(id, request){

        try{

            const editAppliance = async() => {
                let applianceUpdated = await Appliance.findByIdAndUpdate(id, request);
                return applianceUpdated;
            }

            return editAppliance();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

}

module.exports = { MongoApplianceService };