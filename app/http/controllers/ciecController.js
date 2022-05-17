'use strict'

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const GeneralInfo = require("../models/GeneralInfo");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const ciecController = {

    show: async(request, response) => {
        try{
            let comercial = await ComercialInfo.findOne({ rfc: {$eq: request.params.rfc} });
            let generalInfo = await GeneralInfo.findOne({ rfcPerson: {$eq: request.params.rfc} });
            if(comercial || generalInfo !== null){
                let client;
                comercial !== null ? client  = await Client.findOne({ idComercialInfo: {$in: [comercial]} }) 
                : client = await Client.findOne({ idGeneralInfo: {$in: [generalInfo]} });
                return response.json({ 
                    code: 200,
                    rfc: comercial,
                    rfcPerson: generalInfo,
                    client: client
                });
            }else{
                return response.json({
                    code: 404,
                    message: "User not found"
                });
            }
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
        let ciec = request.body.ciec;
        let idUser = request.body.idUser;
        let rfc = request.body.rfc;
        let n4_93_ciec = ciec;
        n4_93_ciec = Buffer.from(n4_93_ciec).toString('base64');
        // let idUser = request.headers.tokenDecoded.data.id;

        try{
            let comercial = await ComercialInfo.findById(id);
            let user = await User.findById(idUser);
            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', 
                    { name: 'n4_93_ciec', value: n4_93_ciec }
                );

                let err = dealUpdated.error;

                if(err){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: ciec",
                        error: err
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg: "Algo salió mal tratando de actualizar información | Hubspot: ciec"
                });
            }

            let comercialInfoParams = {
                ciec,
                rfc,
            };

            await ComercialInfo.findByIdAndUpdate(comercial._id, comercialInfoParams);

            user = await User.findById(idUser);

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

module.exports = ciecController;