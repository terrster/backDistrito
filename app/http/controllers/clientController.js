'use strict'

const Client = require("../models/Client");

const clientController = {

    show: async(request, response) => {
        let id = request.params.id || request.headers.tokenDecoded.data.id;

        try{
            let client = await Client.findById(id);

            return response.json({ 
                code: 200,
                client: client 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener un cliente",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;

        try{
            let clientUpdated = await Client.findByIdAndUpdate(id, request);

            return response.json({ 
                code: 200,
                msg: "Cliente actualizado exitosamente",
                client: clientUpdated 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar un cliente",
                error: error
            });
        }
    }

}

module.exports = clientController;