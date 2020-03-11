'use strict'

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

const express = require("express");
const route = express.Router();
const path = require("path");

//Controllers
const dealController = require("../app/http/controllers/dealController");
const User = require('../app/http/models/User')

route.get("/", (request, response) => {
    response.status(200).sendFile('index.html', { root: path.join(__dirname, '../public') });
});

//////////////login url
route.post('/signin', async (req, res, next) => {

    const { email, password } = req.body;
    
    ////////////////existing mail verification
    const user = await User.findOne({ email: email })
    if (!user) {
        res.status(404).json({ status: "Correo electronico incorrecto"})
    }
    
    //////////////////password verification
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
        return res.status(404).json({status: "Contrasena Incorrecta"})
    }
    /////////////////token generation pending
    ///////////////
    ///////////////////


    res.json({ auth: true, user })
});

route.post('/sign_in', dealController.store);


module.exports = route;