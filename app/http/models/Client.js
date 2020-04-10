const { Schema, model }= require('mongoose');

const clientSchema = new Schema({
    idUser: { type: String, default: '' },
    score: String,
    type: String,
    subType: String,
    appliance: [{ type: Schema.Types.ObjectId, ref: 'Appliance' }],
    sign: String,
    registerDate: { type: Date, default: Date.now },
    idDocuments: [{ type: Schema.Types.ObjectId, ref: 'Documents' }],
    idGeneralInfo: [{ type: Schema.Types.ObjectId, ref: 'GeneralInfo' }],
    idComercialInfo: [{ type: Schema.Types.ObjectId, ref: 'ComercialInfo' }],
    credits: Array,
}, { collection: 'Client' });

var collectionName = 'Client'

module.exports = model('Client', clientSchema, collectionName)