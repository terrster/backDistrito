'use strict'

const Address = require("../models/Address");
const User = require("../models/User");

const addressController = {

    show: async(request, response) => {
        let id = request.params.id;//id de address

        try{
            let address = await Address.findById(id);

            return response.json({ 
                code: 200,
                address: address 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener una dirección",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;//id de address
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let {
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            } = request.body;
            let addressParams = {
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            };

            await Address.findByIdAndUpdate(id, addressParams);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Dirección actualizada exitosamente",
                user: user 
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la dirección",
                error: error
            });
        }
    }

}

module.exports = addressController;