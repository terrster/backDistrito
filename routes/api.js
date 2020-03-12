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

//Controllers
const dealController = require("../app/http/controllers/dealController");

route.use(verifyToken);

//Deal routes
route.group("/deal", (deal) => {
    deal.get('/:id', dealController.show);
    deal.put('/:id', dealController.update);
    //deal.delete('/:id', dealController.destroy);
});

    
module.exports = route;