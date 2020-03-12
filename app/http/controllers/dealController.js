'use strict'

const validator = require("validator");
const { HubspotService } = require("../services/HubspotService");
const newDeal = require("../models/newDeal");

//const hubspotService = new HubspotService();

var dealController = {

    getAllDeals: async (request, response) => {
        var deals = await HubspotService.getAllDeals('parametro');

        response.status(200).send(deals);
    },
    store: async (request, response) => {
        request.body.message = "DEAL POST";
        response.status(200).send(request.body);
    },
    show: async (request, response) => {
        response.status(200).send("DEAL SHOW : " + request.params.id);
    },
    update: async (request, response) => {
        request.params.id;
        request.body.message = "DEAL PUT";
        response.status(200).send(request.body);
    },
    // destroy: async (request, response) => {
    //     response.status(200).send("DEAL DESTROY : " + request.params.id);
    // }

}

module.exports = dealController;