'use strict'

const GeneralInfo = require("../models/GeneralInfo");
const User = require("../models/User");
const Address = require("../models/Address");
const Reference = require("../models/Reference");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

var generalInfoController = {

    store: async(request) => {
        let id = request.headers.tokenDecoded.data.id;

        try{
            let user = await User.find(id).select('-idClient');

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
                last4
            };

            generalInfoParams.push({
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
            });

            let GeneralInfoStored = await GeneralInfo.create(generalInfoParams);

            let applianceStored = await Appliance.create({
                idClient: {
                    _id: user.idClient[0]._id
                },
                idGeneralInfo : {
                    _id : GeneralInfoStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id,{
                appliance: {
                    _id: applianceStored._id
                },
                idGeneralInfo: {
                    _id: GeneralInfoStored._id
                }
            });

            return response.json({ 
                code: 200,
                msg: "Información general guardada exitosamente",
                general: GeneralInfoStored 
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
        let id = request.params.id || request.headers.tokenDecoded.data.id;

        try{
            let user = await User.findById(id);

            let general = await GeneralInfo.findById(user.idClient[0].idGeneralInfo[0]);

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
    update: async(request) => {//Pendiente
        try{

        } 
        catch(error){
            console.log(error);
        }
    }

}

module.exports = generalInfoController;
