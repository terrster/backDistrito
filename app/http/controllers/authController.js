'use strict'

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");

const privateKey = fs.readFileSync(path.resolve("config/private.key"));
const options = require("../../../config/jwt_options");

const authController = {

    login: async (request, response) => { 
        const { email, password } = request.body;

        const user = await User.findOne({ email: email });
        

        if(!user){
            return response.status(200).json({ msg: "Correo electrónico incorrecto" });
        }

        const validPassword = await user.validatePassword(password);

        if(!validPassword) {
            return response.status(200).json({ msg: "Contraseña incorrecta" });
        }

        if(user && validPassword){
            const payload = {
                id : user._id
            };
            const token = jwt.sign(payload, privateKey, options);
            return response.json({
                user: user,
                token: token
            });
        } 
        else{
            return response.json({ 
                mensaje: "Usuario o contraseña incorrectos"
            });
        }
    }

}

module.exports = authController;
