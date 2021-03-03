'use strict'

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Client = require("../models/Client");
const PasswordsResets = require("../models/PasswordsResets");
const Finerio = require("../models/Finerio");

const userController = require("../controllers/userController");
const hubspotController = require("../controllers/hubspotController");

const privateKey = fs.readFileSync(path.resolve("config/jwt/private.key"));
const options = require("../../../config/jwt/jwt_options");
const validationsManager = require("../services/validationsManager");
const tokenManager = require("../services/tokenManager");
const mailManager = require("../services/mailManager");

const authController = {

    sigin: async(request, response) => {
        try{
            let data = request.body;

            let userExist = await User.findOne({ email: data.email.trim() });
            let contactExist = await hubspotController.contact.getByEmail(data.email.trim());

            let userExistMin = await User.findOne({ email: data.email.toLowerCase().trim() });
            let contactExistMin = await hubspotController.contact.getByEmail(data.email.toLowerCase().trim());

            if(userExist || contactExist || userExistMin || contactExistMin){
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

            if(dealStored.code == 403){
                await hubspotController.contact.delete(data.hubspotContactId);
                return response.json(dealStored);
            }

            data.hubspotDealId = dealStored.dealId;

            let userStored = await User.create(data);

            let clientStored = await Client.create({ idUser: { _id: userStored._id }});

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

        let user = await User.findOne({ email: email.trim() });

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
            let token = jwt.sign(payload, privateKey, { algorithm: "RS256" });//Generate a token without expiration
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
    },
    forgotten_password: async(request, response) => {
        const { email } = request.body;

        if(!email){
            return response.status(200).json({ 
                code: 500,
                msg: "Correo electrónico no proveído" 
            });
        }

        try{
            let userNormal = await User.findOne({ email: email }, {}, { autopopulate: false });
            let userMin = await User.findOne({ email: email.toLowerCase() }, {}, { autopopulate: false });

            if(!userNormal && !userMin){
                return response.status(200).json({ 
                    code: 500,
                    msg: "Correo electrónico incorrecto" 
                });
            }

            let user = (userNormal ? userNormal : userMin);

            const payload = {
                email : user.email
            };
            const hash = jwt.sign(payload, privateKey, options);

            let emailSent = await mailManager.forgot_password({
                email: user.email,
                hash: hash
            });

            if(emailSent.code == 200){
                await User.findByIdAndUpdate(user._id, { recoverPassHash: hash }, { autopopulate: false });

                return response.json({
                    code: 200,
                    msg: "Hash de recuperación de contraseña creado exitosamente"
                });
            }
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Ha ocurrido un error al crear el hash de recuperación de contraseña"
            });
        }
    },
    validate_resetHash: async(request, response) => {
        var hash = request.params.hash;

        try{
            const isEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if(isEmail.test(hash)){//Si no es hash es el email del usuario
                let user = await User.findOne({"email": hash});
                hash = user.recoverPassHash;
            }
            
            let token = await tokenManager.validate(hash);

            if(token.code == 403 || token.code == 404){
                return response.status(200).json(token);
            }
            else{
                let password_reset = await PasswordsResets.findOne({ recoverPassHash: hash });
        
                if(password_reset){
                    return response.status(200).json({ 
                        code: 500,
                        msg: "La contraseña ya ha sido cambiada" 
                    });
                }
            }

            return response.status(200).json(token);
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Ha ocurrido un error al validar el hash de recuperación de contraseña"
            });
        }
    },
    reset_password: async(request, response) => {
        let hash = request.params.hash;
        let { password } = request.body;

        try{
            let token = await tokenManager.decode(hash);

            if(token.code == 403 || token.code == 404){
                return response.status(200).json(token);
            }

            let password_reset = await PasswordsResets.findOne({ recoverPassHash: hash });
    
            if(password_reset){
                return response.status(200).json({ 
                    code: 500,
                    msg: "La contraseña ya ha sido cambiada" 
                });
            }

            let user = await User.findOne({ email: token.data.email }, { autopopulate: false });
    
            if(!user){
                return response.status(200).json({ 
                    code: 500,
                    msg: "El correo electrónico no coincide con los registros" 
                });
            }
    
            if(!password){
                return response.status(200).json({ 
                    code: 500,
                    msg: "Nueva contraseña no proveída" 
                });
            }
    
            user = await User.findOneAndUpdate({ email: token.data.email }, {password}, { new: true, autopopulate: false });
    
            await PasswordsResets.create({
                email: user.email,
                recoverPassHash: hash
            });
    
            return response.json({
                code: 200,
                msg: "Contraseña cambiada exitosamente",
                user: user
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Ha ocurrido un error al cambiar la contraseña"
            });
        }  
    }

}

module.exports = authController;
