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

route.get("/", (request, response) => {
    response.status(200).sendFile(path.resolve("public/index.html"));
});

route.post('/signin', authController.sigin);
route.post('/login', authController.login);
route.post("/forgot_password", authController.forgotten_password);
route.get("/validate_resetHash/:hash", authController.validate_resetHash);
route.post("/reset_password/:hash", authController.reset_password);

module.exports = route;
