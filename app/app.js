'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
//const cors = require('cors');

const app = express();

//Routing
const webRoutes = require("../routes/web");
const apiRoutes = require("../routes/api");
const privateRoutes = require("../routes/private");

//Middlewares
app.use(bodyParser.urlencoded( {extended:false} ));
app.use(bodyParser.json());
app.use(fileUpload());

//CORS
app.use((request, response, next) => {
    const allowedOrigins = ['https://distritopyme.com', 'https://dev.distritopyme.com', 'https://api-v2.finerio.mx'];
    const origin = request.headers.origin;
    
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', '*');
    // response.header('Access-Control-Allow-Headers', 'token, Authorization, X-API-KEY, Origin, X-Requested-With, User-Agent, Content-Type, Accept, Access-Control-Allow-Request-Method');
    response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    if((process.env.APP_ENV === 'dev' || process.env.APP_ENV === 'production') && allowedOrigins.includes(origin)){
        next();
    }
    else if(process.env.APP_ENV === 'local'){
        next();
    }
    else{
        let site = (origin != undefined ? origin : request.headers.host);
        return response.json({
            status: 403,
            msg: `The site ${site} does not have permission. Only specific domains are allowed to access it.`
        });
    }
});

//Prefix or routes
app.use(webRoutes);
app.use('/api', apiRoutes);
app.use('/private/api/', privateRoutes);

module.exports = app;
