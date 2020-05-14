'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const app = express();

//Routing
const webRoutes = require("../routes/web");
const apiRoutes = require("../routes/api");

//Middlewares
app.use(bodyParser.urlencoded( {extended:false} ));
app.use(bodyParser.json());
app.use(fileUpload({
    limits: { fileSize: 100000 * 1024 * 1024 },
}));

//CORS
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'token, Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Prefix or routes
app.use(webRoutes);
app.use('/api', apiRoutes);

module.exports = app;