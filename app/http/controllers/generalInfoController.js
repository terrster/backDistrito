'use strict'

const GeneralInfo = require("../models/GeneralInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Reference = require("../models/Reference");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const generalInfoController = {

    store: async(request) => {
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

            let reference1 = {
                name : request.name1,
                phone : request.phone1,
                relative : request.relative1
            }

            let reference1Stored = await Reference.create(reference1);

            let reference2 = {
                name : request.name2,
                phone : request.phone2,
                relative : request.relative2
            }

            let reference2Stored = await Reference.create(reference2);

            let {
                name,
                lastname,
                secondLastname,
                civilStatus,
                birthDate,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4
            } = request.body;
            let generalInfoParams = {
                name,
                lastname,
                secondLastname,
                civilStatus,
                birthDate,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4,
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
                status : true
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

        try{
            let general = await GeneralInfo.findById(id);

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

            await Address.findByIdAndUpdate(general.address[0]._id, addressParams);

            let reference1 = {
                name : request.name1,
                phone : request.phone1,
                relative : request.relative1
            }

            await Reference.findByIdAndUpdate(general.contactWith[0]._id, reference1);

            let reference2 = {
                name : request.name2,
                phone : request.phone2,
                relative : request.relative2
            }

            await Reference.findByIdAndUpdate(general.contactWith[1]._id, reference2);

            let {
                name,
                lastname,
                secondLastname,
                civilStatus,
                birthDate,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4
            } = request.body;
            let generalInfoParams = {
                name,
                lastname,
                secondLastname,
                civilStatus,
                birthDate,
                rfcPerson,
                ciec,
                phone,
                mortgageCredit,
                carCredit,
                creditCard,
                last4
            };

            await GeneralInfo.findByIdAndUpdate(general._id, generalInfoParams);

            let user = await User.findById(idUser);

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
