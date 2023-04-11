'use strict'

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

const express = require("express");
const route = express.Router();

//Controllers
const authController = require("../app/http/controllers/authController");
const counterController = require("../app/http/controllers/counterController");
const finerioController = require("../app/http/controllers/finerioController");
const impulsoMxController = require("../app/http/controllers/impulsoMxController");
const allieController = require("../app/http/controllers/allieController");
const brokerController = require("../app/http/controllers/brokerController");
const landingController = require("../app/http/controllers/landingController");
const ciecController = require("../app/http/controllers/ciecController");
const HubspotController = require("../app/http/controllers/hubspotController");
const dataController = require("../app/http/controllers/dataController");



route.post('/signin', authController.sigin);
route.post('/login', authController.login);
route.post('/register', authController.createUserAdmin);
route.post('/admin/login', authController.loginUserAdmin);
route.post('/delete', authController.eliminate_user);
route.post("/forgot_password", authController.forgotten_password);
route.get("/validate_resetHash/:hash", authController.validate_resetHash);
route.post("/reset_password/:hash", authController.reset_password);

//ciec
// route.post("/ciec", ciecController.create);
//prueba
route.get("/control/buro", dataController.getControl);
route.post("/control/unykoo", dataController.setBuro);
route.get("/control/buro/unykoo", dataController.getUnykoo);
route.post("/control/buro", dataController.updateControl);
route.post("/control/ciec", dataController.getCiec);
route.post("/control/addburo", dataController.addBuro);
route.get("/control/consultas", dataController.getConsultas);
route.get("/control/consultas/:id", dataController.getConsulta);
// route.post("/buro", BuroController.Prospector);

//Contador
route.post("/counter/:type", counterController.add);
route.get("/counter", counterController.total);

route.get("/owners", HubspotController.getOwners.get);

//Callbacks - Finerio
route.all('/finerio/notify', finerioController.notify);
route.all('/finerio/success', finerioController.success);
route.all('/finerio/failure', finerioController.failure);

route.get("/impmx/getDealData/:id", impulsoMxController.show);
route.post("/impmx/getSecurityCode", impulsoMxController.getSecurityCode);
route.post("/impmx/store", impulsoMxController.store);
route.put("/impmx/update", impulsoMxController.update);

route.post("/allie", allieController.store);
route.post("/broker", brokerController.store);
route.post("/contact", landingController.contact);

module.exports = route;
