'use strict'

const GeneralInfo = require("../models/GeneralInfo");

const { MongoAddressService } = require("../services/MongoAddressService");
const { MongoReferenceService } = require("../services/MongoReferenceService");

class MongoGeneralInfoService {

    static getGeneralInfo(id){

        try{

            const generalInfo = async() => {

                let info = await GeneralInfo.findById(id);
                //console.log(info);
                return info;
            }

            return generalInfo();

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

    static storeGeneralInfo(idClient, request){

        try{

            const createAddress = async() => {

                let address = await MongoAddressService.storeAddress(request);
                return address;

            }

            let newAddress = createAddress();

            const createReference1 = async() => {

                let reference = {
                    name : request.name1,
                    phone : request.phone1,
                    relative : request.relative1
                }

                let refernceCreated = await MongoReferenceService.storeReference(reference);
                return refernceCreated;
            }

            let reference1 = createReference1();

            const createReference2 = async() => {

                let reference = {
                    name : request.name2,
                    phone : request.phone2,
                    relative : request.relative2
                }

                let refernceCreated = await MongoReferenceService.storeReference(reference);
                return refernceCreated;
            }

            let reference2 = createReference2();

            const createInfo = async() => {

                const infoGral = new GeneralInfo();
                infoGral.name = request.name;
                infoGral.lastname = request.lastname;
                infoGral.secondLastname = request.secondLastname;
                infoGral.civilStatus = request.civilStatus;
                infoGral.birthDate = request.birthDate;
                infoGral.rfcPerson = request.rfcPerson;
                infoGral.ciec = request.ciec;
                infoGral.phone = request.phone;
                infoGral.address = {//id from Addres model
                    _id : newAddress._id
                }
                infoGral.mortgageCredit = request.mortgageCredit;
                infoGral.carCredit = request.carCredit;
                infoGral.creditCard = request.creditCard;
                infoGral.contactWith = [//Array of id's from Reference model
                    {
                        _id : reference1._id
                    },
                    {
                        _id : reference2._id
                    }
                ];
                infoGral.last4 = request.last4;
                infoGral.idClient = {
                    _id : idClient
                }
                infoGral.status = true;

                let infoGeneralCreated = await infoGral.save();
                return infoGeneralCreated;
                
            }

            return createInfo();

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

    static updateGeneralInfo(idClient, request){
        
        try{

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

}

module.exports = { MongoGeneralInfoService };