'use strict'

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const GeneralInfo = require("../models/GeneralInfo");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");
const {google} = require('googleapis');
const Sheets = require("../controllers/sheetsController");

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



const cieclogic = {

    serch : async (rfc, ciec, response) => {
        try {
            let comercial = await ComercialInfo.findOne({ rfc: {$eq: rfc} });
            let generalInfo = await GeneralInfo.findOne({ rfcPerson: {$eq: rfc} });
            let client;
            if(comercial !== null){
                client  = await Client.findOne({ idComercialInfo: {$in: [comercial]} })
                try{
                    let { idUser, idComercialInfo } = client;
                    let user = await cieclogic.update({idUser, idComercialInfo, ciec, rfc});
                    return user;
                } catch (error) {
                    let response = {
                        code: 500,
                        msg: "Error al actualizar el cliente"
                    }
                    return  response;
                }
            } else if(generalInfo !== null){
                client  = await Client.findOne({ idGeneralInfo: {$in: [generalInfo]} })
                try{
                    let { idUser, idComercialInfo } = client;
                    let user = await cieclogic.update({idUser, idComercialInfo, ciec, rfc});
                    return user;
                } catch (error) {
                    let response = {
                        code: 500,
                        msg: "Error al actualizar el cliente"
                    }
                    return  response;
                }
                
            } else {
                await Sheets.start(rfc, ciec);            
                let response = {
                    code: "404",
                    msg: "No se encontró el cliente",
                }
                return  response;
            }
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                msg: "Error al buscar el cliente"
            });
        }
    },

    update: async(request, response) => {
        let {idUser, idComercialInfo, rfc , ciec} = request;
        let id = idComercialInfo;
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
                    let response = {
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: ciec",
                        error: err
                    };
                    return response;
                }
            }
            else{
                let response = {
                    code: 500,
                    msg : "Algo salió mal tratando de actualizar información | Hubspot: ciec",
                    error: err
                };
                return response;
            }

            let comercialInfoParams = {
                ciec,
            };

            await ComercialInfo.findByIdAndUpdate(comercial._id, comercialInfoParams);

            user = await User.findById(idUser);

            let response = {
                code: 200,
                msg : "la información fue actualizada exitosamente",
            };
            return response;

        } 
        catch(error){
            console.log(error);
            let response = {
                code: 500,
                msg : "Algo salió mal tratando de actualizar información",
                error: error
            };
            return response;
        }
    },

    
}

const rfcValido = (rfc, aceptarGenerico = true) => {
    let _rfc_pattern_pm = "^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
             "(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
             "(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
             "(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
    let _rfc_pattern_pf = "^(([A-ZÑ&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
                  "(([A-ZÑ&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
                  "(([A-ZÑ&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
                  "(([A-ZÑ&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
  let rfcTest =  rfc.match(_rfc_pattern_pm) || rfc.match(_rfc_pattern_pf);
    if(rfcTest && rfc.length <= 13){
        return true;
    } else {
        return false;
    }
}

const ciecController = {

    create: async (req, res) => {
        try{
            let {
                rfc,
                ciec
            } = req.body;
            if(rfcValido(rfc) && ciec.length === 8){
                let userExistMin = await cieclogic.serch(rfc,ciec);
                userExistMin.code === 200 ? res.status(200).json(userExistMin) : res.status(500).json(userExistMin);
                return res;
            } else {
                res.status(500).json({
                    code: 500,
                    msg: "El RFC o CIEC no son válidos"
                });
            }
        }
        catch(error){
            console.log(error);
            res.status(500).json(error);
        }
    },

}



module.exports = ciecController