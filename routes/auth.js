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

app.post('/auth', (request, response) => {
    if(request.body.email === "prueba@correo.com" && request.body.password === "12345678"){
        const payload = {//datos a encriptar
            check: true 
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