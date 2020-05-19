'use strict'

/*
|--------------------------------------------------------------------------
| Api Routes
|--------------------------------------------------------------------------
*/

const express = require("express");
require("express-group-routes");
const route = express.Router();

//Middlewares
const verifyToken = require("../app/http/middlewares/verifyToken");
const tokenManager = require("../app/http/services/tokenManager");

//Controllers
const userController = require("../app/http/controllers/userController");
const dealController = require("../app/http/controllers/dealController");
const infoController = require("../app/http/controllers/infoController");
const amountController = require("../app/http/controllers/amountController");
const documentsController = require("../app/http/controllers/documentsController");

route.use(verifyToken);
route.use(async(request, response, next) => {
    request.headers.tokenDecoded = await tokenManager.decode(request.headers.token);
    next();
});

//User routes
route.group('/user', (user) => {
	user.get('/info', userController.getUserInfo)
});

//Deal routes
route.group("/deal", (deal) => {
    deal.get('/:id', dealController.show);
    deal.put('/:id', dealController.update);
    //deal.delete('/:id', dealController.destroy);
});

//Info
route.group("/info", (info) => {
    info.get('/general', infoController.getGeneralInfo);
    info.post('/general/store', infoController.storeOrUpdateGeneralInfo);
    info.put('/general/update', infoController.storeOrUpdateGeneralInfo);

    info.get('/comercial', infoController.getComercialInfo);
    info.post('/comercial/store', infoController.storeOrUpdateComercialInfo);
    info.put('/comercial/update', infoController.storeOrUpdateComercialInfo);
});

//Amount
route.group("/amount", (amount) => {
    amount.get('', amountController.getAmount);
    amount.post('/store', amountController.storeOrUpdateAmount);
    amount.put('/update', amountController.storeOrUpdateAmount);
});

//Documents routes
route.group("/upload", (upload) => {
    upload.post('', documentsController.store);
    upload.put('/:id', documentsController.update);
});

/* Falta por acomodar en sus controladores correspondientes!!!!!!!!!!!!!!!!! */

// const User = require('../app/http/models/User')
// const Address = require('../app/http/models/Address')
// const Appliance = require('../app/http/models/Appliance')
// const Amount = require('../app/http/models/Amount')
// const Client = require('../app/http/models/Client')
// const ComercialInfo = require('../app/http/models/ComercialInfo')
// const Credit = require('../app/http/models/Credit')
// const Documents = require('../app/http/models/Documents')
// const GeneralInfo = require('../app/http/models/GeneralInfo')
// const Proposal = require('../app/http/models/Proposal')
// const Reference = require('../app/http/models/Reference')

// route.get('/update/amount/:id', async (req, res, next) => {
//     const amount = await Amount.find({ _id: `${req.params.id}`})
//     res.json({amount })
// })

// route.put('/update/amount/:id', async (req, res, next) => {
//     let amountId = req.params.id
//     const { howMuch, whyNeed, whenNeed, term, yearSales, status} = req.body;
//     const amount = {
//         howMuch,
//         whyNeed,
//         whenNeed,
//         term,
//         yearSales,
//         status
//     };
//     await Amount.findByIdAndUpdate( amountId, amount )
//     res.json({status: "Datos Actualizados con éxito", amount })
// })

// route.get('/update/generalInfo/:id', async (req, res, next) => {
//     const generalInfo = await GeneralInfo.find({ _id: `${req.params.id}`})
//     res.json({generalInfo })
// })

// route.put('/update/generalInfo/:id', async (req, res, next) => {
//     let generalInfoId = req.params.id
//     const {
//         civilStatus,
//         name,
//         secondLastname,
//         lastname,
//         birthDate,
//         phone,
//         mortgageCredit,
//         carCredit,
//         creditCard,
//         registerDate,
//         status,
//         ciec,
//         last4
//     } = req.body;
//     const generalInfo = {
//         civilStatus,
//         name,
//         secondLastname,
//         lastname,
//         birthDate,
//         phone,
//         mortgageCredit,
//         carCredit,
//         creditCard,
//         registerDate,
//         status,
//         ciec,
//         last4
//     };
//     await Amount.findByIdAndUpdate( generalInfoId, generalInfo )
//     res.json({status: "Datos Actualizados con éxito", generalInfo })
// })

// route.get('/update/comercialInfo/:id', async (req, res, next) => {
//     const comercialInfo = await ComercialInfo.find({ _id: `${req.params.id}`})
//     res.json({comercialInfo })
// })

// route.put('/update/comercialInfo/:id', async (req, res, next) => {
//     let comercialInfoId = req.params.id
//     const {
//             comercialName,
//             gyre,
//             rfc,
//             specific,
//             phone,
//             registerDate,
//             terminal,
//             warranty,
//             status,
//             facebook,
//             webSite,
//             businessName
//     } = req.body;
//     const comercialInfo = {
//             comercialName,
//             gyre,
//             rfc,
//             specific,
//             phone,
//             registerDate,
//             terminal,
//             warranty,
//             status,
//             facebook,
//             webSite,
//             businessName
//     };
//     await Amount.findByIdAndUpdate( comercialInfoId, comercialInfo )
//     res.json({status: "Datos Actualizados con éxito", comercialInfo })
// })

// route.get('/update/reference/:id', async (req, res, next) => {
//     const reference = await Reference.find({ _id: `${req.params.id}`})
//     res.json({reference })
// })

// route.put('/update/reference/:id', async (req, res, next) => {
//     let referenceId = req.params.id
//     const {
//         name,
//         phone,
//         relative
//     } = req.body;
//     const reference = {
//         name,
//         phone,
//         relative
//     };
//     await Amount.findByIdAndUpdate( referenceId, reference )
//     res.json({status: "Datos Actualizados con éxito", comercialInfo })
// })
    
module.exports = route;
