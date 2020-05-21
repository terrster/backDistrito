'use strict'

const Appliance = require("../models/Appliance");
const User = require("../models/User");

const applianceController = {

    show: async(request, response) => {
        let id = request.params.id;//id de solicitud

        try{
            let appliance = await Appliance.findById(id);
            
            return response.json({ 
                code: 200,
                appliance: appliance
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
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            await Appliance.findByIdAndUpdate(id, request.body);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Solicitud actualizada exitosamente",
                user: user 
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