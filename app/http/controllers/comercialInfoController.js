'use strict'

const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

var comercialInfoController = {

    store: async(request, response) => {
        try{
            let user = await userController.show(request);

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
            let addressStored = await Address.create(addressParams);

            let {
                comercialName,
                businessName,
                gyre,
                rfc,
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                warranty
            } = request.body;

            let comercialInfoParams = {
                comercialName,
                businessName,
                gyre,
                rfc,
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                warranty
            };

            comercialInfoParams.push({
                address: {
                    _id: addressStored._id
                },
                status : true
            });

            let comercialInfoStored = await ComercialInfo.create(comercialInfoParams);

            let applianceStored = await Appliance.create({
                idClient: {
                    _id: user.idClient[0]._id
                },
                idComercialInfo : {
                    _id : comercialInfoStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id,{
                appliance: {
                    _id: applianceStored._id
                },
                idComercialInfo: {
                    _id: comercialInfoStored._id
                }
            });

            return response.json({ 
                code: 200,
                msg: "Información comercial guardada exitosamente",
                comercial: comercialInfoStored 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de guardar la información comercial",
                error: error
            });
        }
    },
    show: async(request, response) => {
        let id = request.params.id || request.headers.tokenDecoded.data.id;

        try{
            let user = await User.findById(id);

            let comercial = await ComercialInfo.findById(user.idClient[0].idComerciallInfo[0]);

            return response.json({ 
                code: 200,
                comercial: comercial 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información comercial",
                error: error
            });
        }
    },
    update: async(id, request) => {//Pendiente
        try{

        } 
        catch(error){
            console.log(error);
        }
    }

}

module.exports = comercialInfoController;
