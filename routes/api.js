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
const hubspotController = require("../app/http/controllers/hubspotController");
const clientController = require("../app/http/controllers/clientController");
const applianceController = require("../app/http/controllers/applianceController");
const amountController = require("../app/http/controllers/amountController");
const comercialInfoController = require("../app/http/controllers/comercialInfoController");
const generalInfoController = require("../app/http/controllers/generalInfoController");
const addressController = require("../app/http/controllers/addressController");
const referenceController = require("../app/http/controllers/referenceController");
const documentsController = require("../app/http/controllers/documentsController");
const finerioController = require("../app//http/controllers/finerioController");

route.use(verifyToken);
route.use(async(request, response, next) => {
    request.headers.tokenDecoded = await tokenManager.decode(request.headers.token);
    next();
});

//User routes
route.group('/user', (user) => {
    user.get('/:id', userController.show);
    user.put('/:id', userController.update);
});

//Deal routes
route.group("/deal", (deal) => {
    deal.post('', hubspotController.deal.store);
    deal.get('/:id', hubspotController.deal.show);
    deal.put('/:id', hubspotController.deal.update);
});

//Client routes
route.group('/client', (client) => {
    client.get('/:id', clientController.show);
    client.put('/:id', clientController.update);
});

// Appliance routes
route.group("/appliance", appliance => {
	appliance.put('/:id', applianceController.update);
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

//Finerio routes - Open banking
route.group("/finerio", (finerio) => {
    finerio.get('/test', finerioController.test);

    //Banks
    finerio.get('/banks', finerioController.getBanks);
    finerio.get('/bank/:id/fields', finerioController.getBank);

    //Customers
    finerio.post('/customers', finerioController.storeCustomer);
    finerio.get('/customers', finerioController.getCustomers);
    finerio.get('/customers/:id', finerioController.getCustomer);
    finerio.put('/customers/:id', finerioController.updateCustomer);
    finerio.delete('/customers/:id', finerioController.deleteCustomer);

    //Credentials
    finerio.post('/credentials', finerioController.storeCredential);
    finerio.get('/credentials/customer/:id', finerioController.getCredentials);
    finerio.get('/credentials/:id', finerioController.getCredential);
    finerio.put('/credentials/:id', finerioController.updateCredential);
    finerio.delete('/credentials/:id', finerioController.deleteCredential);

    //Accounts
    finerio.get('/accounts/:id', finerioController.getAccounts);
    finerio.get('/accounts/:id/details', finerioController.getAccount);

    //Transactions
    finerio.get('/transactions/:id', finerioController.getTransactions);
});
    
module.exports = route;
