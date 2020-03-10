'use strict'

const validator = require("validator");
const HubspotService = require("../services/HubspotService");
const newDeal = require("../models/newDeal");

var hubspotService = new HubspotService();

var dealController = {

    store: (request, response) => {
        request.body.message = "DEAL POST";
        response.status(200).send(request.body);
    },
    show: (request, response) => {
        response.status(200).send("DEAL SHOW : " + request.params.id);
    },
    update: (request, response) => {
        request.params.id;
        request.body.message = "DEAL PUT";
        response.status(200).send(request.body);
    },
    // destroy: (request, response) => {
    //     response.status(200).send("DEAL DESTROY : " + request.params.id);
    // }

}

module.exports = dealController;