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

route.get("/", (request, response) => {
    response.status(200).sendFile(path.resolve("public/index.html"));
});

route.post('/sign_in', dealController.store);

module.exports = route;