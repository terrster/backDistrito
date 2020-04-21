'use strict'

const Document = require("../models/Documents");

class MongoDocumentService {

    static store(request){
    
        
        try{

            const newDocument = async() => {

                const document = new Document();
                document.idClient = {
                    _id : request._id
                }          

                let documentStored = await document.save();
                return documentStored;
            }

            return newDocument();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static update(idDocument, namefile, url){

        try{

            const updateDocument = async() => {
                let updatedDocument = await Document.findOneAndUpdate({_id : idDocument}, {$push: { [namefile] : url } }, {new : true});
                console.log(updatedDocument);
                
                return updatedDocument;
                
            }

            return updateDocument();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

}

module.exports = { MongoDocumentService };