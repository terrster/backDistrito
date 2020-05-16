'user strict'

const { HubspotService } = require("../services/HubspotService");
const { MongoUserService } = require("../services/MongoUserService");
const { MongoClientService } = require("../services/MongoClientService");
const { MongoApplianceService } = require("../services/MongoApplianceService");
const { MongoGeneralInfoService } = require("../services/MongoGeneralInfoService");
const { MongoComercialInfoService } = require("../services/MongoComercialInfoService");
const User = require("../models/User");

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

var infoController = {

    getGeneralInfo: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;
        
        let user = await MongoUserService.getFullUser(id);
        console.log(user);

        if(user.idClient[0].idGeneralInfo !== []){//Get general info
           let info = await MongoGeneralInfoService.getGeneralInfo(user.idClient[0].idGeneralInfo[0]);
           return response.send(info);
        }
		console.log("Responder null");
        return response.send(null);
    },
    storeOrUpdateGeneralInfo: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;
        
        let user = await MongoUserService.getFullUser(id);

        if(user.idClient[0].idGeneralInfo == ""){//Create
            let infoStored = await MongoGeneralInfoService.storeGeneralInfo(user.idClient[0]._id, request.body);
            let applianceStored = await MongoApplianceService.storeAppliance({
                idGeneralInfo : {
                    _id : infoStored._id
                }
            });
            /*
             * INTENTE CREAR UN IDCLIENT CON LOS DATOS QUE SE GUARDAN Y ACTUALIZAR ESA PROPIEDAD DEL USUARIO PERO NO LA ACTUALIZA
            const newIdClient = user.idClient[user.idClient.length - 1];
            newIdClient.idGeneralInfo = [...newIdClient.idGeneralInfo, infoStored._id]
            newIdClient.appliance = [...newIdClient.appliance, applianceStored._id]
            const updateUserData = {
				_id: id,
				idClient: [newIdClient]
			}
            const test = await User.findOneAndUpdate({ _id : id}, {"idClient": updateUserData }, {new : true});
            * */
            return response.json({ message: 'Datos creatos correctamente' });
        }
        else{//Edit
            let infoUpdated = await MongoGeneralInfoService.updateGeneralInfo(user.idClient[0].idGeneralInfo[0], request);
            let applianceUpdated = await MongoApplianceService.updateAppliance(user.idClient[0].appliance[0], {
                idGeneralInfo : {
                    _id : infoUpdated._id
                }
            });
            return response.json({infoUpdated});
        }
    },
    getComercialInfo: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;

        let user = await MongoUserService.getFullUser(id);

        if(user.idClient[0].idComercialInfo != ""){//Get comercial info
            let info = await MongoComercialInfoService.getComercialInfo(user.idClient[0].idGeneralInfo[0]);
            //console.log(info);
            return response.status(200).send(info);
        }
    },
    storeOrUpdateComercialInfo: async(request, response) => {
		console.log(request.headers.tokenDecoded);
        let id = request.headers.tokenDecoded.data.id;

        let user = await MongoUserService.getFullUser(id);

        if(user.idClient[0].idComercialInfo == ""){//Create
            let infoStored = await MongoComercialInfoService.storeComercialInfo(request);
            let applianceStored = await MongoApplianceService.storeAppliance({
                idComercialInfo : {
                    _id : infoStored._id
                }
            });
            return infoStored;
        }
        else{//Edit
            let infoUpdated = await MongoComercialInfoService.updateComercialInfo(user.idClient[0].idComercialInfo[0], request);
            let applianceUpdated = await MongoApplianceService.updateAppliance(user.idClient[0].appliance[0], {
                idComercialInfo : {
                    _id : infoUpdated._id
                }
            });
            return infoUpdated;
        }
    }

}

module.exports = infoController;
