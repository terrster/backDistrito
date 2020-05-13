'use strict'

const ComercialInfo = require('../models/ComercialInfo');

const { MongoAddressService } = require("../services/MongoAddressService");

class MongoComercialInfoService {

    static getComercialInfo(id){

        try{

            const ComercialInfo = async() => {

                let info = await ComercialInfo.findById(id);
                //console.log(info);
                return info;
            }

            return ComercialInfo();

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

    static storeComercialInfo(request){

        try{

            const createAddress = async() => {

                let address = await MongoAddressService.storeAddress(request);
                return address;

            }

            let newAddress = createAddress();

            const createInfo = async() => {

                const infoComercial = new ComercialInfo();
                infoComercial.comercialName = request.comercialName;
                infoComercial.businessName = request.businessName;
                infoComercial.gyre = request.gyre;
                infoComercial.rfc = request.rfc;
                infoComercial.specific = request.specific;
                infoComercial.phone = request.phone;
                infoComercial.address = {//id from Addres model
                    _id : newAddress._id
                }
                infoComercial.webSite = request.webSite;
                infoComercial.facebook = request.facebook;
                infoComercial.terminal = request.terminal;
                infoComercial.warranty = request.warranty;
                infoComercial.status = true;

                let infoComercialCreated = await infoComercial.save();
                return infoComercialCreated;
                
            }

            return createInfo();

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

    static updateComercialInfo(id, request){
        
        try{

        }
        catch(error){
            console.log(error);
            return null;
        }

    }

}

module.exports = { MongoComercialInfoService };