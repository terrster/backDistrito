'use strict'

const hubspotController = require("../controllers/hubspotController");
const Client = require("../models/Client");
const User = require("../models/User");

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
        let idUser = request.headers.tokenDecoded.data.id;

        try{            
            if(request.body.type){//tipo de negocio
                let _user = await User.findById(idUser);
                if(_user){
                   await hubspotController.deal.update(_user.hubspotDealId,'type',request.body);
                }
                else{
                    return response.json({
                        code: 500,
                        msg: "Algo salió mal tratando de obtener un usuario | Hubspot: type"
                    });
                }
            }

            await Client.findByIdAndUpdate(id, request.body);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Cliente actualizado exitosamente",
                user: user 
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