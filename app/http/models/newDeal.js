'use strict'

const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var newDealSchema = Schema({
    numeroderegistro: String,
    nombre_comercial: String,
    email: String,
    celular: String,
    hubspot_owner_assigneddate : { type: Date, default: Date.now},
    dealname: String
});

module.exports = mongoose.model('NewDeal', newDealSchema);