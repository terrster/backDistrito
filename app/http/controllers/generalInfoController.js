'use strict'

const hubspotController = require("../controllers/hubspotController");
const GeneralInfo = require("../models/GeneralInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Reference = require("../models/Reference");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const generalInfoController = {

    store: async(request, response) => {
        let id = request.params.id;//id de user

        request.body.birthDate = `${request.body.day}/${request.body.month}/${request.body.year}`;

        try{
            let user = await User.findById(id);

            let {
                street,//info address  
                extNumber, 
                intNumber, 
                town, 
                zipCode,
                name1,//info reference 1
                phone1,
                relative1,
                name2,//info reference 2
                phone2,
                relative2,
                name,//info general
                lastname,
                secondLastname,
                civilStatus,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4,
                birthDate
            } = request.body;

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'general', { 
                    street,//info address  
                    extNumber, 
                    intNumber, 
                    town, 
                    zipCode,
                    name1,//info reference 1
                    phone1,
                    relative1,
                    name2,//info reference 2
                    phone2,
                    relative2,
                    name,//info general
                    lastname,
                    secondLastname,
                    civilStatus,
                    rfcPerson,
                    ciec,
                    phone,
                    mortgageCredit,
                    carCredit,
                    creditCard,
                    last4,
                    birthDate
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de guardar información | Hubspot: general",
                        error: dealUpdated.error
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg: "Algo salió mal tratando de guardar información | Hubspot: general"
                });
            }

            let addressParams = {
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            };

            let addressStored = await Address.create(addressParams);

            let reference1 = {
                name: name1,
                phone: phone1,
                relative: relative1
            }

            let reference1Stored = await Reference.create(reference1);

            let reference2 = {
                name: name2,
                phone: phone2,
                relative: relative2
            }

            let reference2Stored = await Reference.create(reference2);

            let generalInfoParams = {
                name,
                lastname,
                secondLastname,
                civilStatus,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4,
                birthDate,
                address: {
                    _id: addressStored._id
                },
                contactWith: [
                    {
                        _id : reference1Stored._id
                    },
                    {
                        _id : reference2Stored._id
                    }
                ],
                idClient: {
                    _id: user.idClient[0]._id
                },
                status: true
            };

            let generalInfoStored = await GeneralInfo.create(generalInfoParams);

            await Appliance.findByIdAndUpdate(user.idClient[0].appliance[0]._id, {
                idGeneralInfo : {
                    _id : generalInfoStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id, {
                idGeneralInfo: {
                    _id: generalInfoStored._id
                }
            });

            user = await User.findById(id);

            return response.json({ 
                code: 200,
                msg: "Información general guardada exitosamente",
                user: user 
            });

        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de guardar la información general",
                error: error
            });
        }
    },
    show: async(request, response) => {        
        let id = request.params.id;//id de info general

        try{
            let general = await GeneralInfo.findById(id);

            return response.json({ 
                code: 200,
                general: general 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información general",
                error: error
            });
        }
    },
    update: async(request, response) => {
        let id = request.params.id;//id de info general
        let idUser = request.headers.tokenDecoded.data.id;

        request.body.birthDate = `${request.body.day}/${request.body.month}/${request.body.year}`;

        try{
            let general = await GeneralInfo.findById(id);
            let user = await User.findById(idUser);

            let {
                street,//info address  
                extNumber, 
                intNumber, 
                town, 
                zipCode,
                name1,//info reference 1
                phone1,
                relative1,
                name2,//info reference 2
                phone2,
                relative2,
                name,//info general
                lastname,
                secondLastname,
                civilStatus,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4,
                birthDate
            } = request.body;
            
            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'general', { 
                    street,//info address  
                    extNumber, 
                    intNumber, 
                    town, 
                    zipCode,
                    name1,//info reference 1
                    phone1,
                    relative1,
                    name2,//info reference 2
                    phone2,
                    relative2,
                    name,//info general
                    lastname,
                    secondLastname,
                    civilStatus,
                    rfcPerson,
                    ciec,
                    phone,
                    mortgageCredit,
                    carCredit,
                    creditCard,
                    last4,
                    birthDate
                });

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: general",
                        error: dealUpdated.error
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg: "Algo salió mal tratando de actualizar información | Hubspot: general"
                });
            }

            let addressParams = {
                street, 
                extNumber, 
                intNumber, 
                town, 
                zipCode
            };

            await Address.findByIdAndUpdate(general.address[0]._id, addressParams);

            let reference1 = {
                name: name1,
                phone: phone1,
                relative: relative1
            }

            await Reference.findByIdAndUpdate(general.contactWith[0]._id, reference1);

            let reference2 = {
                name: name2,
                phone: phone2,
                relative: relative2
            }

            await Reference.findByIdAndUpdate(general.contactWith[1]._id, reference2);

            let generalInfoParams = {
                name,
                lastname,
                secondLastname,
                civilStatus,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4,
                birthDate
            };

            await GeneralInfo.findByIdAndUpdate(general._id, generalInfoParams);

            user = await User.findById(idUser);

            return response.json({ 
                code: 200,
                msg: "Información general actualizada exitosamente",
                user: user 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la información general",
                error: error
            });
        }
    }

}

module.exports = generalInfoController;
