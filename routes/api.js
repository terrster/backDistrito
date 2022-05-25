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
const ciec = require("../app/http/controllers/ciecController");
const clientController = require("../app/http/controllers/clientController");
const applianceController = require("../app/http/controllers/applianceController");
const amountController = require("../app/http/controllers/amountController");
const comercialInfoController = require("../app/http/controllers/comercialInfoController");
const generalInfoController = require("../app/http/controllers/generalInfoController");
const addressController = require("../app/http/controllers/addressController");
const referenceController = require("../app/http/controllers/referenceController");
const documentsController = require("../app/http/controllers/documentsController");
const finerioController = require("../app//http/controllers/finerioController");
const openBankingController = require("../app//http/controllers/openBankingController");
const kykoyaController = require("../app/http/controllers/kykoyaController");

const ciecController = ciec.ciecController;
const brokerData = ciec.brokerDataController;


route.use(verifyToken);
route.use(async(request, response, next) => {
    request.headers.tokenDecoded = await tokenManager.decode(request.headers.token);
    next();
});


//User routes
route.group('/user', (user) => {
    user.get('/:id', userController.show);
    user.put('/:id', userController.update);
    user.post('/reactivate', userController.reactivate);
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

route.group("/ciec" , (ciec) => {
    ciec.put('/:id', ciecController.update);
    ciec.get('/:rfc', ciecController.show);
});
route.group("/bdata" , (ciec) => {
    // ciec.put('/:id', ciecController.update);
    ciec.get('/:brokercode', brokerData.show);
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
    documents.delete('/:id', documentsController.delete);
});

//Finerio routes
route.group("/finerio", (finerio) => {
    //Banks
    finerio.get('/banks', finerioController.getBanks);
    finerio.get('/bank/:id/fields', finerioController.getBank);

    //Customers
    finerio.get('/cleancustomers', finerioController.cleanCustomers);
    finerio.post('/customers', finerioController.storeCustomer);
    finerio.get('/customers/:cursor?', finerioController.getCustomers);
    finerio.get('/customer/:id', finerioController.getCustomer);
    finerio.put('/customers/:id', finerioController.updateCustomer);
    finerio.delete('/customers/:id', finerioController.deleteCustomer);

    //Credentials
    // finerio.post('/credentials', finerioController.storeCredential);
    finerio.get('/credentials/customer/:id', finerioController.getCredentials);
    finerio.get('/credentials/:id', finerioController.getCredential);
    finerio.put('/credentials/:id', finerioController.updateCredential);
    finerio.delete('/credentials/:id', finerioController.deleteCredential);
    finerio.get('/credentials/messages/failure', finerioController.getCredentialsErrors);

    //Accounts
    finerio.get('/accounts/:id', finerioController.getAccounts);
    finerio.get('/accounts/:id/details', finerioController.getAccount);

    //Transactions
    finerio.get('/transactions/:id', finerioController.getTransactions);
});

//Open banking
route.group("/open-banking", (credentials) => {
    credentials.post('/store', openBankingController.store);
    credentials.post('/storeToken', openBankingController.storeToken);
    credentials.delete('/delete', openBankingController.storeToken);
});

//Kykoya
route.group("/kykoya", (kykoya) => {
    kykoya.post("/bureau-report", kykoyaController.createBureauReport);
    kykoya.get("/bureau-reports/:id", kykoyaController.getBureauReport);
    kykoya.get("/bureau-reports", kykoyaController.listBureauReports);
    kykoya.post("/prospector", kykoyaController.createProspector);
    kykoya.get("/prospector/:id", kykoyaController.getProspector);
});

module.exports = route;
