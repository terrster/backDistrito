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
const pdfController = require("../app/http/controllers/pdfController");
const circuloCreditoController = require("../app/http/controllers/circuloCreditoController");

// route.use((request, response, next) => {
//     if(!request.query.tokensecret){
//         response.json({ 
//             mensaje: 'Token no proveído' 
//         });  
//     }
//     else{
//         if(request.query.tokensecret != 'D7Mqvg5aPcypn97dxdB/Kfe330wwu0IXx0pFQXIFmjs='){
//             response.json({ 
//                 mensaje: 'Token inválido' 
//             }); 
//         }
//     }
    
//     next();
// });

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

//Finerio routes - Open banking
route.group("/impmx", (impmx) => {
    impmx.get('/alta/:id', circuloCreditoController.alta);
});

module.exports = route;