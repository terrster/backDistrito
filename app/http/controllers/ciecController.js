'use strict'

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const GeneralInfo = require("../models/GeneralInfo");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api.hubapi.com/',
    headers: {
        "Content-Type": "application/json"
    }
});
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const hapiKey = `?hapikey=${process.env.HAPIKEY}`;

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

const brokerDataController = {

    show: async(request, response) => {
            console.log(request.params);
            try{
                console.log(request.params.brokercode);
                const response = await axios.get('owners/v2/owners/' + request.params.brokercode + hapiKey)
                let { firstName, lastName, email, } = response.data;
                return response.json({
                    code: 200,
                    broker: {
                        firstName,
                        lastName,
                        email
                    }
                });
            }
            catch(error){
                let response = {
                    code: 403,
                    msg: "El codígo broker no existe"
                };
    
                return response;
            }
    }
}

module.exports = {ciecController, brokerDataController};