'use strict'

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const finerioController = require("../controllers/finerioController");
const Finerio = require("../models/Finerio");

const comercialInfoController = {

    store: async(request, response) => {
        let id = request.params.id;//id de user

        try{
            let user = await User.findById(id);

            let {
                state,//info address 
                municipality,
                street,
                extNumber, 
                intNumber, 
                town, 
                zipCode,
                comercialName,//info comercial
                businessName,
                gyre,
                rfc,
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                warranty,
                ciec,
                banks
            } = request.body;

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'comercial', { 
                    state,//info address 
                    municipality,
                    street,
                    extNumber, 
                    intNumber, 
                    town, 
                    zipCode,
                    comercialName,//info comercial
                    businessName,
                    gyre,
                    rfc,
                    specific,
                    phone,
                    webSite,
                    facebook,
                    terminal,
                    ciec,
                    warranty
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de guardar información | Hubspot: comercial",
                        error: dealUpdated.error
                    });
                }
             }
             else{
                 return response.json({
                     code: 500,
                     msg: "Algo salió mal tratando de guardar información | Hubspot: comercial"
                 });
             }

            let addressParams = {
                state,
                municipality,
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            };

            let addressStored = await Address.create(addressParams);

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
                ciec,
                warranty,
                address: {
                    _id: addressStored._id
                },
                status : true
            };

            let comercialInfoStored = await ComercialInfo.create(comercialInfoParams);

            await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                idComercialInfo : {
                    _id : comercialInfoStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient._id, {
                idComercialInfo: {
                    _id: comercialInfoStored._id
                }
            });

            if(banks.length > 0){

                let finerioAPI = await finerioController.storeCustomer(user.email);
                let credentials = [];

                for await(let bank of banks){
                    let params = {
                        customerId : finerioAPI.data.id,
                        bankId : bank.id,
                        username : bank.username,
                        password : bank.password,
                        securityCode : bank.securityCode ? bank.securityCode : null
                    }

                    let finerioCredentialAPI = await finerioController.storeCredential(params);

                    credentials.push({
                        id: finerioCredentialAPI.data.id,
                        idBank : params.bankId,
                        username : params.username
                    });
                }

                let params = {
                    idFinerio : finerioAPI.data.id,
                    credentials : credentials
                }

                let finerio = await Finerio.create(params);
                await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                    idFinerio : {
                        _id : finerio._id
                    }
                });
            }

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
            let user = await User.findById(idUser);

            let {
                state,//info address
                municipality,
                street,
                extNumber, 
                intNumber, 
                town, 
                zipCode,
                comercialName,//info comercial
                businessName,
                gyre,
                rfc,
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                ciec,
                warranty,
                banks
            } = request.body;

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'comercial', { 
                    state,//info address
                    municipality,
                    street, 
                    extNumber, 
                    intNumber, 
                    town, 
                    zipCode,
                    comercialName,//info comercial
                    businessName,
                    gyre,
                    rfc,
                    specific,
                    phone,
                    webSite,
                    facebook,
                    terminal,
                    ciec,
                    warranty
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: comercial",
                        error: dealUpdated.error
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg: "Algo salió mal tratando de actualizar información | Hubspot: comercial"
                });
            }

            let addressParams = {
                state,
                municipality,
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            };

            await Address.findByIdAndUpdate(comercial.address._id, addressParams);

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
                ciec,
                warranty
            };

            await ComercialInfo.findByIdAndUpdate(comercial._id, comercialInfoParams);

            if(banks.length >= 0){

                if(!user.idClient.appliance[0].idFinerio){//Si no tiene idFinerio
                    let finerioAPI = await finerioController.storeCustomer(user.email);
                    let credentials = [];

                    for await(let bank of banks){
                        let params = {
                            customerId : finerioAPI.data.id,
                            bankId : bank.id,
                            username : bank.username,
                            password : bank.password,
                            securityCode : bank.securityCode ? bank.securityCode : null
                        }

                        let finerioCredentialAPI = await finerioController.storeCredential(params);

                        credentials.push({
                            id: finerioCredentialAPI.data.id,
                            idBank : params.bankId,
                            username : params.username
                        });
                    }

                    let params = {
                        idFinerio : finerioAPI.data.id,
                        credentials : credentials
                    }

                    let finerio = await Finerio.create(params);
                    await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                        idFinerio : {
                            _id : finerio._id
                        }
                    });
                }
                else{//Si tiene, crear o actualizar credenciales
                    let credentials = [];

                    for await(let bank of banks){
                        
                        if(bank.idCredential){ //console.log("Update")
                            let params = {
                                customerId : user.idClient.appliance[0].idFinerio.idFinerio,
                                idCredential : bank.idCredential,
                                bankId : bank.id,
                                username : bank.username,
                                password : bank.password,
                                securityCode : bank.securityCode ? bank.securityCode : null
                            }
        
                            await finerioController.updateCredential(params);
                            
                            credentials.push({
                                id: params.idCredential,
                                idBank : params.bankId,
                                username : params.username
                            });
                        }
                        else{
                            let params = {
                                customerId : user.idClient.appliance[0].idFinerio.idFinerio,
                                bankId : bank.id,
                                username : bank.username,
                                password : bank.password,
                                securityCode : bank.securityCode ? bank.securityCode : null
                            }
        
                            let finerioCredentialAPI = await finerioController.storeCredential(params);
        
                            credentials.push({
                                id: finerioCredentialAPI.data.id,
                                idBank : params.bankId,
                                username : params.username
                            });
                        }
                    }

                    await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});
                }
            }

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

module.exports = comercialInfoController;
