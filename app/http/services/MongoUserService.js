'use strict'

const User = require("../models/User");

class MongoUserService {

    static storeUser(request){
        
        try{

            const newUser = async() => {

                var user = new User();
                user.name = request.name;
                user.lastName = request.lastname;
                user.access = "USER";
                user.email = request.email;
                user.password = await user.encryptPassword(request.password);
                user.phone = request.phone;
                //user.hubspotContactId = request.hubspotContactId;
                user.hubspotDealId = request.hubspotDealId;

                user.save((error, userStored) => {
                    if(error){
                        console.log(error);
                        
                        return null;
                    }
                    console.log(userStored);
                    return {userStored};
                });

            }

            return newUser();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static getUser(request){

    }

    static updateUser(request){

    }

    static deleteUser(request){

    }

}

module.exports = { MongoUserService };