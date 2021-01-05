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
    const allowedOrigins = ['https://distritopyme.com', 'https://dev.distritopyme.com', 'https://impmx.com', 'https://dev.impmx.com', 'https://api-v2.finerio.mx'];
    const origin = request.headers.origin;
    
    // response.header('Access-Control-Allow-Origin', '*');
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
        /*
            In some cases Cloudflare will block some ip directions even if the domains were added 
            in the const called allowed origins. In order to manage this issues is necessary enter 
            to Cloudflare/Firewall and in the general information you will find the blocked ip directions.
            Then you need to add the ip in tools section in the part of access rules of ip. 
        */
        /*
            Finerio: 3.21.17.42
        */
        const allowedIPS = ['3.21.17.42'];

        if(allowedIPS.includes(request.headers['x-forwarded-for'])){
            next();
        }
        else{
            return response.json({
                status: 403,
                msg: `You don´t have permissions. Only specific domains are allowed to access it.`
            });
        }
    }
});

//Prefix or routes
app.use(webRoutes);
app.use('/api', apiRoutes);
app.use('/private/api/', privateRoutes);

module.exports = app;
