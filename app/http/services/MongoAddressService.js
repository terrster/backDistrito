'use strict'

const Address = require('../models/Address');

class MongoAddressService {

    static storeAddress(request){
        
        try{

            const createAddress = async() => {

                const address = new Address();
                address.street = request.street;
                address.extNumber = request.extNumber;
                address.intNumber = request.intNumber;
                address.town = request.town;
                address.zipCode = request.zipCode;

                let addressCreated = await address.save();
                return addressCreated;
            }

            return createAddress();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al insertar la información"
            };
        }

    }

    // static updateAddress(request){
        
    //     try{

    //         const editAddress = async() => {

    //         }

    //         return editAddress();

    //     }
    //     catch(error){
    //         return {
    //             message : "Ha ocurrido un error al obtener la información"
    //         };
    //     }

    // }

}

module.exports = { MongoAddressService };