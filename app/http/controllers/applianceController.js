'use strict'

const Appliance = require("../models/Appliance");

const applianceController = {

    show: async(request, response) => {
        let id = request.params.id;//id de solicitud

        try{
            let applianceStored = await Appliance.findById(id);
            
            return response.json({ 
                code: 200,
                appliance: applianceStored 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la solicitud",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;//id de solicitud

        try{
            let appliance = await Appliance.findByIdAndUpdate(id, request.body, (error, applianceUpdated) => {
                return applianceUpdated;
            });

            return response.json({ 
                code: 200,
                msg: "Solicitud actualizada exitosamente",
                appliance: appliance 
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