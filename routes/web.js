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
const authController = require("../app/http/controllers/authController");
const counterController = require("../app/http/controllers/counterController");
const finerioController = require("../app/http/controllers/finerioController");
const impulsoMxController = require("../app/http/controllers/impulsoMxController");

route.get("/", (request, response) => {
    response.status(200).sendFile(path.resolve("public/index.html"));
});

route.post('/signin', authController.sigin);
route.post('/login', authController.login);
route.post("/forgot_password", authController.forgotten_password);
route.get("/validate_resetHash/:hash", authController.validate_resetHash);
route.post("/reset_password/:hash", authController.reset_password);

//Contador
route.post("/counter/:type", counterController.add);
route.get("/counter", counterController.total);

//Callback
route.all('/finerio/callback', finerioController.callback);

route.get("/impmx/getDealData/:id", impulsoMxController.show);
route.post("/impmx/getSecurityCode", impulsoMxController.getSecurityCode);
route.post("/impmx/store", impulsoMxController.store);
route.put("/impmx/update", impulsoMxController.update);

module.exports = route;
