'use strict'

const User = require("../models/User");
const Client = require('../models/Client');
const Address = require('../models/Address');
const Appliance = require('../models/Appliance');

class MongoUserService {

    static storeUser(request){
        
        try{

            const newUser = async() => {

                const user = new User();
                user.name = request.name;
                user.lastName = request.lastname;
                user.access = "USER";
                user.email = request.email;
                user.password = await user.encryptPassword(request.password);
                user.phone = request.phone;
                user.hubspotDealId = request.hubspotDealId;
                user.idDistrito = request.idDP;

                let userStored = await user.save();
                //console.log(userStored);
                return userStored;
            }

            return newUser();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static getUser(id){

        try{

            const showUser = async() => {

                let user = await User.findById(id);
                return user;
            }

            return showUser();
        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static getFullUser(id){

        try{

            const showUser = async() => {

                let user = await User.findById(id)
                                    .populate({ 
                                        path: "idClient address",
                                        populate: {
                                            path: 'appliance',
                                            populate: {
                                                path: "idDocuments idAmount idGeneralInfo idComercialInfo",
                                                populate: {
                                                    path: "address contactWith",
                                                }
                                            }
                                        }
                                    });
                return user;
            }

            return showUser();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            }
        }
    }

    static getLastUser(){

        try{

            const lastUser = async() => {

               let user = await User.findOne({}, {}, { sort: { 'createdAt' : -1 } });
               return user;

            }

            return lastUser();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }

    }

    static updateUser_Client(request){
        try{

            const updateUser = async() => {

                let updatedUser = await User.findOneAndUpdate({_id : request._id}, {"idClient": request.idClient}, {new : true});
                return updatedUser;
                
            }

            return updateUser();

        }
        catch(error){
            return {
                message : "Ha ocurrido un error al obtener la información"
            };
        }
    }

    static deleteUser(request){

    }

}

module.exports = { MongoUserService };