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
    response.status(200).sendFile('index.html', { root: path.join(__dirname, '../public') });
});

route.post('/sign_in', dealController.store);

route.post('/get_all_deals', dealController.getAllDeals);


module.exports = route;