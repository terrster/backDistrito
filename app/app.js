'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

//Routing
const webRoutes = require("../routes/web");
const apiRoutes = require("../routes/api");

//Middlewares
app.use(bodyParser.urlencoded( {extended:false} ));
app.use(bodyParser.json());
app.use(fileUpload({
    limits: { fileSize: 100000 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : '../public/tmpFiles/'
}));

//CORS
app.use('*', cors());

//Prefix or routes
app.use(webRoutes);
app.use('/api', apiRoutes);

module.exports = app;
