'use strict'

const Client = require("../models/Client");

const clientController = {

    show: async(request, response) => {
        let id = request.params.id;//id de client

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
        let id = request.params.id;//id de client

        try{
            let client = await Client.findByIdAndUpdate(id, request.body, (error, clientUpdated) => {
                return clientUpdated;
            });

            return response.json({ 
                code: 200,
                msg: "Cliente actualizado exitosamente",
                client: client 
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