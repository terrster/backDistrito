'use strict'

const express = require("express");
const http = require('http');
const path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const db = require('./database');
const socket = require('../app/socket/socketEvents');
const cron = require("../app/cron/cronJobs");

class Server{
    constructor(){
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || 3900;
        this.db = new db();
        this.cron = new cron();
    }

    middlewares(){
        this.app.use(express.static(path.resolve(__dirname, '../public')));
        this.app.use(bodyParser.urlencoded( {extended:false} ));
        this.app.use(bodyParser.json());
        this.app.use(fileUpload());

        this.app.use((request, response, next) => {
            const allowedOrigins = ['https://distritopyme.com', 'https://www.distritopyme.com', 'https://www.dev.distritocasa.com', 'https://dev.distritocasa.com','https://distritocasa.com','https://www.distritocasa.com', 'https://www.dev.distritopyme.com', 'https://dev.distritopyme.com', 'https://impmx.com', 'https://dev.impmx.com', 'https://api-v2.finerio.mx'];
            const origin = request.headers.origin || '';
            
            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Headers', '*');
            response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            response.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
                    
            if((process.env.APP_ENV === 'dev' || process.env.APP_ENV === 'production') && (allowedOrigins.includes(origin) || origin.search("distritopyme.netlify.app") > 0)){
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
                    - IP's -
                    Finerio: 3.21.17.42
                */
                const allowedIPS = ['3.21.17.42'];
        
                if(request.headers.hasOwnProperty('tokensecret')){                    
                    if(request.headers.tokensecret === 'D7Mqvg5aPcypn97dxdB/Kfe330wwu0IXx0pFQXIFmjs='){
                        next();
                    }
                    else{
                        return response.json({
                            status: 403,
                            msg: `You don´t have permissions to access, your token secret is incorrect.`
                        });
                    }
                }
                else if(allowedIPS.includes(request.headers['x-forwarded-for'])){
                    next();
                }
                else{
                    return response.json({
                        status: 403,
                        msg: `You don´t have permissions. Only specific domains are allowed to access.`
                    });
                }
            }
        });
    }

    routing(){
        this.app.use('/', require("../routes/web"));
        this.app.use('/api', require("../routes/api"));
        this.app.use('/private/api/', require("../routes/private"));
    }

    initialize(){
        try{
            this.middlewares();
            this.routing();
            this.server.listen(this.port, async() => {
                console.log(`Server running on port: ${this.port}`);
    
                await this.db.connect();
    
                global.io = new socket(this.server);
    
                // this.cron.initialize();
            });
        }
        catch(error){
            console.log(error);
            console.log("Something went wrong trying to initialize the server");
        }
    }
}

module.exports = Server;