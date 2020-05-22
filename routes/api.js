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
const hubspotController = require("../app/http/controllers/hubspotController");
const userController = require("../app/http/controllers/userController");
const clientController = require("../app/http/controllers/clientController");
const amountController = require("../app/http/controllers/amountController");
const comercialInfoController = require("../app/http/controllers/comercialInfoController");
const generalInfoController = require("../app/http/controllers/generalInfoController");
const addressController = require("../app/http/controllers/addressController");
const referenceController = require("../app/http/controllers/referenceController");
const documentsController = require("../app/http/controllers/documentsController");

route.use(verifyToken);
route.use(async(request, response, next) => {
    request.headers.tokenDecoded = await tokenManager.decode(request.headers.token);
    next();
});

//Deal routes
route.group("/deal", (deal) => {
    deal.post('', hubspotController.deal.store);
    deal.get('/:id', hubspotController.deal.show);
    deal.put('/:id', hubspotController.deal.update);
});

//User routes
route.group('/user', (user) => {
    user.get('/:id', userController.show);
    user.put('/:id', userController.update);
});

//Client routes
route.group('/client', (client) => {
    client.get('/:id', clientController.show);
    client.put('/:id', clientController.update);
});

//Amount routes
route.group("/amount", (amount) => {
    amount.post('/:id', amountController.store);
    amount.get('/:id', amountController.show);
    amount.put('/:id', amountController.update);
});

//Info comercial routes
route.group("/info-comercial", (comercial) => {
    comercial.post('/:id', comercialInfoController.store);
    comercial.get('/:id', comercialInfoController.show);
    comercial.put('/:id', comercialInfoController.update);
});

//Info general routes
route.group("/info-general", (general) => {
    general.post('/:id', generalInfoController.store);
    general.get('/:id', generalInfoController.show);
    general.put('/:id', generalInfoController.update);
});

//Address routes
route.group("/address", (address) => {
    address.get('/:id', addressController.show);
    address.put('/:id', addressController.update);
});

//Reference routes
route.group("/reference", (reference) => {
    reference.get('/:id', referenceController.show);
    reference.put('/:id', referenceController.update);
});

//Documents routes
route.group("/documents", (documents) => {
    documents.post('/:id', documentsController.store);
    documents.put('/:id', documentsController.update);
});
    
module.exports = route;
