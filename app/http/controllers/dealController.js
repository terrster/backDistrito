'use strict'

const validator = require("validator");
const { HubspotService } = require("../services/HubspotService");
const { MongoUserService } = require("../services/MongoUserService");
const bcrypt = require('bcrypt');
//const newDeal = require("../models/newDeal");

//const hubspotService = new HubspotService();

var dealController = {

    store: async (request, response) => { 

        if(request.body && Object.keys(request.body).length){
            const passwordHash = await bcrypt.hash(request.body.password, 12);

            var newDeal = request.body;
            //console.log(newDeal);
            //conexión con HB
            var storeDeal = await HubspotService.storeDeal(newDeal);
            
            //conexión con MongoDB
            if(storeDeal){
                newDeal.hubspotDealId = storeDeal.dealId;
                var newUser = await MongoUserService.storeUser(newDeal);

                if(newUser){
                    return response.status(200).send({
                        message: "Registro exitoso"
                    });
                }
                else{
                    return response.status(200).send({
                        message: "Ha ocurrido un error al guardar un nuevo usuario"
                    });
                }

            }
            else{
                return response.status(200).send({
                    message: "Ha ocurrido un error al guardar un nuevo deal"
                });
            }
            // response.status(200).send({
            //     message: "Con datos para guardar"
            // });
        }
        else{
            return response.status(200).send({
                message: "Sin datos para guardar"
            });
        }

    },
    show: async (request, response) => {
        response.status(200).send("DEAL SHOW : " + request.params);
    },
    update: async (request, response) => {

        var editDeal = await HubspotService.updateDeal(request);
        request.params.id;
        request.body.message = "DEAL PUT";
        response.status(200).send(request.body);
    },
    destroy: async (request, response) => {
        
        var deleteDeal = await HubspotService.deleteDeal(request.params);
        response.status(200).send("DEAL DESTROY : " + request.params.id);
    }

}

module.exports = dealController;