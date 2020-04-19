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
const documentsController = require("../app/http/controllers/documentsController");
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
                                        path: "idDocuments idAmount idGeneralInfo idComercialInfo",
                                        populate: {
                                            path: "address contactWith",
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

route.get('/update/amount/:id', async (req, res, next) => {
    const amount = await Amount.find({ _id: `${req.params.id}`})
    res.json({amount })
})

route.put('/update/amount/:id', async (req, res, next) => {
    let amountId = req.params.id
    const { howMuch, whyNeed, whenNeed, term, yearSales, status} = req.body;
    const amount = {
        howMuch,
        whyNeed,
        whenNeed,
        term,
        yearSales,
        status
    };
    await Amount.findByIdAndUpdate( amountId, amount )
    res.json({status: "Datos Actualizados con éxito", amount })
})

route.get('/update/generalInfo/:id', async (req, res, next) => {
    const generalInfo = await GeneralInfo.find({ _id: `${req.params.id}`})
    res.json({generalInfo })
})

route.put('/update/generalInfo/:id', async (req, res, next) => {
    let generalInfoId = req.params.id
    const {
        civilStatus,
        name,
        secondLastname,
        lastname,
        birthDate,
        phone,
        mortgageCredit,
        carCredit,
        creditCard,
        registerDate,
        status,
        ciec,
        last4
    } = req.body;
    const generalInfo = {
        civilStatus,
        name,
        secondLastname,
        lastname,
        birthDate,
        phone,
        mortgageCredit,
        carCredit,
        creditCard,
        registerDate,
        status,
        ciec,
        last4
    };
    await Amount.findByIdAndUpdate( generalInfoId, generalInfo )
    res.json({status: "Datos Actualizados con éxito", generalInfo })
})

route.get('/update/comercialInfo/:id', async (req, res, next) => {
    const comercialInfo = await ComercialInfo.find({ _id: `${req.params.id}`})
    res.json({comercialInfo })
})

route.put('/update/comercialInfo/:id', async (req, res, next) => {
    let comercialInfoId = req.params.id
    const {
            comercialName,
            gyre,
            rfc,
            specific,
            phone,
            registerDate,
            terminal,
            warranty,
            status,
            facebook,
            webSite,
            businessName
    } = req.body;
    const comercialInfo = {
            comercialName,
            gyre,
            rfc,
            specific,
            phone,
            registerDate,
            terminal,
            warranty,
            status,
            facebook,
            webSite,
            businessName
    };
    await Amount.findByIdAndUpdate( comercialInfoId, comercialInfo )
    res.json({status: "Datos Actualizados con éxito", comercialInfo })
})

route.get('/update/reference/:id', async (req, res, next) => {
    const reference = await Reference.find({ _id: `${req.params.id}`})
    res.json({reference })
})

route.put('/update/reference/:id', async (req, res, next) => {
    let referenceId = req.params.id
    const {
        name,
        phone,
        relative
    } = req.body;
    const reference = {
        name,
        phone,
        relative
    };
    await Amount.findByIdAndUpdate( referenceId, reference )
    res.json({status: "Datos Actualizados con éxito", comercialInfo })
})

route.post('/sign_in', dealController.store);

route.post('/upload', documentsController.store);
route.put('/upload/:id', documentsController.update);

module.exports = route;