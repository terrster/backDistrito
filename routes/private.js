'use strict'

/*
|--------------------------------------------------------------------------
| Private Routes
|--------------------------------------------------------------------------
*/

const express = require("express");
require("express-group-routes");
const route = express.Router();

const solicitudController = require("../app/http/controllers/solicitudController");
const finerioController = require("../app//http/controllers/finerioController");
const pdfController = require("../app//http/controllers/pdfController");

route.use((request, response, next) => {
    if(!request.query.token){
        response.json({ 
            mensaje: 'Token no proveído' 
        });  
    }
    else{
        if(request.query.token != 'D7Mqvg5aPcypn97dxdB/Kfe330wwu0IXx0pFQXIFmjs='){
            response.json({ 
                mensaje: 'Token inválido' 
            }); 
        }
    }
    
    next();
});

//Solicitud routes
route.group("/solicitud", (solicitud) => {
    solicitud.get('/aspiria/:id?', solicitudController.aspiria);
});

//Finerio routes - Open banking
route.group("/finerio", (finerio) => {
    finerio.get('/user/transactions/:id?', finerioController.getAllTransactions);
});

//Pdf routes
route.group("/pdf", (pdf) => {
    pdf.get('/user/transactions/:id?', pdfController.transactions);
});

module.exports = route;