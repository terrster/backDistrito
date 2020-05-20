'use strict'

const Appliance = require("../models/Appliance");

const applianceController = {

    store: async(request) => {
        try{
            let applianceStored = await Appliance.create(request);
            return applianceStored;
        }
        catch(error){
            console.log(error);
        }
    },
    update: async(id, request) => {
        try{
            let applianceUpdated = await Appliance.findByIdAndUpdate(id, request);

            return response.json({ 
                code: 200,
                msg: "Solicitud actualizada exitosamente",
                applianceUpdated: applianceUpdated 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar una solicitud",
                error: error
            });
        }
    }

}

module.exports = applianceController;