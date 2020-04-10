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

    static updateClient(request){

    }

    static deleteClient(request){

    }

}

module.exports = { MongoClientService };