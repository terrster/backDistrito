'use strict'

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const ciecController = {

    show: async(request, response) => {
		let id = request.params.id;//info comercial
        let idUser = request.headers.tokenDecoded.data.id;
        try{
            let comercial = await ComercialInfo.findById(id);
            let user = await User.findById(idUser);

            if(user){
                return response.json({ 
                    code: 200,
                    user: user,
                    comercial: comercial 
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
        let rfc = request.body.rfc;
        let n4_93_ciec = ciec;
        n4_93_ciec = Buffer.from(n4_93_ciec).toString('base64');
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let comercial = await ComercialInfo.findById(id);
            let user = await User.findById(idUser);

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', 
                    { name: 'n4_93_ciec', value: n4_93_ciec }
                );
                let dealUpdated2 = await hubspotController.deal.update(user.hubspotDealId, 'single_field', 
                    { name: 'n3_rfc', value: rfc }
                );

                let err = dealUpdated.error || dealUpdated2.error;

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
        catch(error){console.log(error)
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la información comercial",
                error: error
            });
        }
    }

}

module.exports = ciecController;