'use strict'

const hubspotController = require("../controllers/hubspotController");
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
                employeesNumber,
                bankAccount, //Only PM
                paymentsMoreThan30,
                empresarialCreditCard, //Only PM, PFAE
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                exportation,
                warranty,
                ciec
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
                    employeesNumber,
                    bankAccount, //Only PM
                    paymentsMoreThan30,
                    empresarialCreditCard, //Only PM, PFAE
                    specific,
                    phone,
                    webSite,
                    facebook,
                    terminal,
                    exportation,
                    warranty
                });

                let CiecUpdated;

                if(ciec){
                    let n4_93_ciec = ciec;
                    n4_93_ciec = Buffer.from(n4_93_ciec).toString('base64');

                    CiecUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', 
                    { name: 'n4_93_ciec', value: n4_93_ciec }
                );
                }

                if(CiecUpdated !== undefined){
                    if(dealUpdated.error || CiecUpdated.error){
                        return response.json({
                            code: 500,
                            msg : "Algo salió mal tratando de actualizar información | Hubspot: comercial",
                            error: dealUpdated.error
                        });
                    }
                } else {
                    if(dealUpdated.error){
                        return response.json({
                            code: 500,
                            msg : "Algo salió mal tratando de actualizar información | Hubspot: comercial",
                            error: dealUpdated.error
                        });
                    }
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
                employeesNumber,
                bankAccount, //Only PM
                paymentsMoreThan30,
                empresarialCreditCard, //Only PM, PFAE
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                exportation,
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
        try{
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
                employeesNumber,
                bankAccount, //Only PM
                paymentsMoreThan30,
                empresarialCreditCard, //Only PM, PFAE
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                exportation,
                ciec,
                warranty
            } = request.body;
            let user = await User.findById(id);

            let comercial = "";
            if(user.idClient.idComercialInfo !== null && user.idClient.idComercialInfo !== undefined){
                comercial = await ComercialInfo.findById(user.idClient.idComercialInfo._id);
            } else {
                let comercialInfoParams = {
                    comercialName,
                    businessName,
                    gyre,
                    rfc,
                    employeesNumber,
                    bankAccount, //Only PM
                    paymentsMoreThan30,
                    empresarialCreditCard, //Only PM, PFAE
                    specific,
                    phone,
                    webSite,
                    facebook,
                    terminal,
                    exportation,
                    ciec,
                    warranty,
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
                comercial = comercialInfoStored;
            }

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
                    employeesNumber,
                    bankAccount, //Only PM
                    paymentsMoreThan30,
                    empresarialCreditCard, //Only PM, PFAE
                    specific,
                    phone,
                    webSite,
                    facebook,
                    terminal,
                    exportation,
                    warranty
                });

                let CiecUpdated;

                if(ciec){
                    let n4_93_ciec = ciec;
                    n4_93_ciec = Buffer.from(n4_93_ciec).toString('base64');

                    CiecUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', 
                    { name: 'n4_93_ciec', value: n4_93_ciec }
                );
                }

                if(CiecUpdated !== undefined){
                    if(dealUpdated.error || CiecUpdated.error){
                        return response.json({
                            code: 500,
                            msg : "Algo salió mal tratando de actualizar información | Hubspot: comercial",
                            error: dealUpdated.error
                        });
                    }
                } else {
                    if(dealUpdated.error){
                        return response.json({
                            code: 500,
                            msg : "Algo salió mal tratando de actualizar información | Hubspot: comercial",
                            error: dealUpdated.error
                        });
                    }
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

            

            if(comercial.address === undefined){
                
                let addressStored = await Address.create(addressParams);
                await ComercialInfo.findByIdAndUpdate(comercial._id, {
                    address: {
                        _id: addressStored._id
                    }
                });
            } else {
                
                await Address.findByIdAndUpdate(comercial.address._id, addressParams);
            }

            let comercialInfoParams = {
                comercialName,
                businessName,
                gyre,
                rfc,
                employeesNumber,
                bankAccount, //Only PM
                paymentsMoreThan30,
                empresarialCreditCard, //Only PM, PFAE
                specific,
                phone,
                webSite,
                facebook,
                terminal,
                exportation,
                ciec,
                warranty
            };

            await ComercialInfo.findByIdAndUpdate(comercial._id, comercialInfoParams);

            user = await User.findById(id);

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
