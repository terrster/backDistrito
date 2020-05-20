'use strict'

const ComercialInfo = require("../models/ComercialInfo");

const userController = require("../controllers/userController");
const addressController = require("../controllers/addressController");
const applianceController = require("../controllers/applianceController");
const clientController = require("../controllers/clientController");

var comercialInfoController = {

    store: async(request) => {
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
            let addressStored = await addressController.store(addressParams);

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

            let applianceStored = await applianceController.store({
                idClient: {
                    _id: user.idClient[0]._id
                },
                idComercialInfo : {
                    _id : comercialInfoStored._id
                }
            });

            await clientController.update(user.idClient[0]._id,{
                appliance: {
                    _id: applianceStored._id
                },
                idComercialInfo: {
                    _id: comercialInfoStored._id
                }
            });

            return comercialInfoStored;
        } 
        catch(error){
            console.log(error);
        }
    },
    show: async(id) => {
        try{
            let info = await ComercialInfo.findById(id);
            return info;
        } 
        catch(error){
            console.log(error);
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
