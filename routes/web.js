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

route.post('/signin', authController.sigin);
route.post('/login', authController.login);
route.post("/forgot_password", authController.forgotten_password);
route.get("/validate_resetHash/:hash", authController.validate_resetHash);
route.post("/reset_password/:hash", authController.reset_password);

//Contador
route.post("/counter/:type", counterController.add);
route.get("/counter", counterController.total);

//Callbacks - Finerio
route.all('/finerio/notify', finerioController.notify);
route.all('/finerio/success', finerioController.success);
route.all('/finerio/failure', finerioController.failure);

route.get("/impmx/getDealData/:id", impulsoMxController.show);
route.post("/impmx/getSecurityCode", impulsoMxController.getSecurityCode);
route.post("/impmx/store", impulsoMxController.store);
route.put("/impmx/update", impulsoMxController.update);

module.exports = route;
