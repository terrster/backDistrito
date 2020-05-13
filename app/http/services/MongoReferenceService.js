'use strict'

const Reference = require('../models/Reference');

class MongoReferenceService {

    static storeReference(request){
        
        try{

            const createReference = async() => {

                const reference = new Reference();
                reference.name = request.name1;
                reference.phone = request.phone1;
                reference.relative = request.relative1;

                let refernceCreated = await reference.save();
                return refernceCreated;
            }

            return createReference();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al insertar la información"
            };
        }

    }

    // static updateReference(request){
        
    //     try{

    //         const editReference = async() => {

    //         }

    //         return editReference();

    //     }
    //     catch(error){
    //         return {
    //             message : "Ha ocurrido un error al obtener la información"
    //         };
    //     }

    // }

}

module.exports = { MongoReferenceService };