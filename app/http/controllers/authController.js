'use strict'

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Client = require("../models/Client");
const userController = require("../controllers/userController");
const hubspotController = require("../controllers/hubspotController");

const privateKey = fs.readFileSync(path.resolve("config/private.key"));
const options = require("../../../config/jwt_options");
const validationsManager = require("../services/validationsManager");

const authController = {

    sigin: async(request, response) => {
        try{
            let data = request.body;

            let userExist = await User.findOne({ email: data.email });

            if(userExist){
                return response.json({ 
                    code: 500,
                    msg: "El correo electrónico ya existe"
                });
            }

            let lastUser = await userController.lastUser();
            data.idDistrito = lastUser.idDistrito + 1;

            let contactStored = await hubspotController.contact.store(data);
            data.hubspotContactId = contactStored.vid;

            let dealStored = await hubspotController.deal.store(data);
            data.hubspotDealId = dealStored.dealId;

            let userStored = await User.create(data);

            let clientStored = await Client.create({ idUser: userStored._id});

            let user = await User.findByIdAndUpdate(userStored._id, { 
                idClient: {
                    _id: clientStored._id
                }
            }, { new: true });
 
            return response.json({ 
                 code: 200, 
                 msg: "Usuario registrado exitosamente",
                 user: user
             });
         }
         catch(error){
             let messages = validationsManager.user(error.errors);
			
             return response.json({
                 code: 500,
                 msg : "Ha ocurrido un error al registrarse",
                 errors: messages
             });
         }
    },
    login: async (request, response) => { 
        let { email, password } = request.body;

        let user = await User.findOne({ email: email });

        if(!user){
            return response.status(200).json({ 
                code: 500,
                msg: "Correo electrónico incorrecto" 
            });
        }

        let validPassword = await user.validatePassword(password);

        if(!validPassword) {
            return response.status(200).json({ 
                code: 500,
                msg: "Contraseña incorrecta" 
            });
        }

        if(user && validPassword){
            let payload = {
                id : user._id
            };
            let token = jwt.sign(payload, privateKey, options);
            return response.json({
                code: 200,
                user: user,
                token: token
            });
        } 
        else{
            return response.json({ 
                code: 500,
                msg: "Usuario o contraseña incorrectos"
            });
        }
    }

}

module.exports = authController;
