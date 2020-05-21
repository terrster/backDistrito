'use strict'

const Reference = require("../models/Reference");

const referenceController = {

    show: async(request, response) => {
        let id = request.params.id;//id de referencia

        try{
            let reference = await Reference.findById(id);

            return response.json({ 
                code: 200,
                reference: reference 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la referencia",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;//id de referencia

        try{
            let referenceParams = {
                name : request.name1,
                phone : request.phone1,
                relative : request.relative1
            }

            let reference = await Reference.findByIdAndUpdate(id, referenceParams, (error, referenceUpdated) => {
                return referenceUpdated;
            });

            return response.json({ 
                code: 200,
                msg: "Referencia actualizada exitosamente",
                reference: reference
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar de la referencia",
                error: error
            });
        }
    }

}

module.exports = referenceController;
