'use strict'

const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const comercialInfoController = {

    store: async(request, response) => {
        let id = request.params.id;//id de user

        try{
            let user = await User.findById(id);

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
                warranty,
                address: {
                    _id: addressStored._id
                },
                status : true
            };

            let comercialInfoStored = await ComercialInfo.create(comercialInfoParams);

            await Appliance.findByIdAndUpdate(user.idClient[0].appliance[0]._id, {
                idComercialInfo : {
                    _id : comercialInfoStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id, {
                idComercialInfo: {
                    _id: comercialInfoStored._id
                }
            });

            user = await User.findById(id);

            return response.json({ 
                code: 200,
                msg: "Información comercial guardada exitosamente",
                user: user
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
        let id = request.params.id;//id de info comercial

        try{
            let comercial = await ComercialInfo.findById(id);

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
    update: async(request, response) => {
        let id = request.params.id;//id de info comercial
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let comercial = await ComercialInfo.findById(id);

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

            await Address.findByIdAndUpdate(comercial.address[0]._id, addressParams);

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

            await ComercialInfo.findByIdAndUpdate(comercial._id, comercialInfoParams);

            let user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Información comercial actualizada exitosamente",
                user: user 
            });

        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la información comercial",
                error: error
            });
        }
    }

}

module.exports = comercialInfoController;
