'use strict'

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const privateKey = fs.readFileSync(path.resolve("config/private.key"));
const options = require("../config/jwt_options");
const User = require('../app/http/models/User');

app.post('/login', async(request, response, next) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email: email });

    if(!user){
        return response.status(404).json({ status: "Correo electronico incorrecto"});
    }

    const validPassword = await user.validatePassword(password);

    if(!validPassword) {
        return response.status(404).json({status: "Contrasena Incorrecta"})
    }

    if(user && validPassword){
        const payload = {
            user
        };
        const token = jwt.sign(payload, privateKey, options);
        response.json({
            mensaje: 'Autenticación correcta',
            token: token
        });
    } 
    else{
        response.json({ 
            mensaje: "Usuario o contraseña incorrectos"
        });
    }
});



module.exports = app;