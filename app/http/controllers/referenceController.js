'use strict'

const Reference = require("../models/Reference");
const User = require("../models/User");

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
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let referenceParams = {
                name: request.name,
                phone: request.phone,
                relative: request.relative
            }

            await Reference.findByIdAndUpdate(id, referenceParams);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Referencia actualizada exitosamente",
                user: user
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
