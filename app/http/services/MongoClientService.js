'use strict'

const Client = require("../models/Client");

class MongoClientService {

    static storeClient(idUser){
        
        try{

            const newClient = async() => {

                const client = new Client();
                client.idUser = idUser;                

                let clientStored = await client.save();
                return clientStored;
            }

            return newClient();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static getClient(request){

    }

    static updateClient(id, request){
        try{

            const editClient = async() => {
                let clientUpdated = await Client.findByIdAndUpdate(id, request);
                return clientUpdated;
            }

            return editClient();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
    }

    static updateClient_Documents(idClient, idDocuments){
        try{

            const updateClient = async() => {

                let updatedClient = await Client.findOneAndUpdate({_id : idClient}, {"idDocuments": idDocuments}, {new : true});
                return updatedClient;
                
            }

            return updateClient();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
    }

    static deleteClient(request){

    }

}

module.exports = { MongoClientService };