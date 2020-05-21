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
const dealController = require("../app/http/controllers/dealController");
const userController = require("../app/http/controllers/userController");
const clientController = require("../app/http/controllers/clientController");
const amountController = require("../app/http/controllers/amountController");
const comercialInfoController = require("../app/http/controllers/comercialInfoController");
const generalInfoController = require("../app/http/controllers/generalInfoController");
const documentsController = require("../app/http/controllers/documentsController");

route.use(verifyToken);
route.use(async(request, response, next) => {
    request.headers.tokenDecoded = await tokenManager.decode(request.headers.token);
    next();
});

//Deal routes
route.group("/deal", (deal) => {
    deal.post('', dealController.store);
    deal.get('/:id', dealController.show);
    deal.put('/:id', dealController.update);
});

//User routes
route.group('/user', (user) => {
    user.get('/:id', userController.show);
    user.put('/:id', userController.update);
});

//Client routes
route.group('/user', (client) => {
    client.get('/:id', clientController.show);
    client.put('/:id', clientController.update);
});

//Amount routes
route.group("/amount", (amount) => {
    amount.post('', amountController.store);
    amount.get('/:id', amountController.show);
    amount.put('/:id', amountController.update);
});

//Info comercial routes
route.group("/info-comercial", (comercial) => {
    comercial.post('', comercialInfoController.store);
    comercial.get('/:id', comercialInfoController.show);
    comercial.put('/:id', comercialInfoController.update);
});

//Info general routes
route.group("/info-general", (general) => {
    general.post('', generalInfoController.store);
    general.get('/:id', generalInfoController.show);
    general.put('/:id', generalInfoController.update);
});

//Documents routes
route.group("/upload", (upload) => {
    upload.post('', documentsController.store);
    upload.put('/:id', documentsController.update);
});
    
module.exports = route;
