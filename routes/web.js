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
const Address = require('../app/http/models/Address')
const Appliance = require('../app/http/models/Appliance')
const Amount = require('../app/http/models/Amount')
const Client = require('../app/http/models/Client')
const ComercialInfo = require('../app/http/models/ComercialInfo')
const Credit = require('../app/http/models/Credit')
const Documents = require('../app/http/models/Documents')
const GeneralInfo = require('../app/http/models/GeneralInfo')
const Proposal = require('../app/http/models/Proposal')
const Reference = require('../app/http/models/Reference')


route.get("/", (request, response) => {
    response.status(200).sendFile(path.resolve("public/index.html"));
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
route.post('/signin', async (req, res, next) => {

    const { email, password } = req.body;
/*
|--------------------------------------------------------------------------
| existing mail verification
|--------------------------------------------------------------------------
*/
    const user = await User.findOne({ email: email })
                            .populate({ 
                                path: "idClient address",
                                populate: {
                                    path: 'appliance',
                                    populate: {
                                        path: "idClient idDocuments idAmount idGeneralInfo idComercialInfo",
                                        populate: {
                                            path: "idClient address contactWith",
                                        }
                                    }
                                }
        })
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