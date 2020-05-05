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
const authController = require("../app/http/controllers/authController");

route.get("/", (request, response) => {
    response.status(200).sendFile(path.resolve("public/index.html"));
});

route.post('/signin', dealController.store);
route.post('/login', authController.login);

module.exports = route;