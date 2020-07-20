const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const clientSchema = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'User'},
    score: String,
    type: String,
    subType: String,
    appliance: [{ type: Schema.Types.ObjectId, ref: 'Appliance', autopopulate: true }],
    sign: String,
    registerDate: { type: Date, default: utc },
    idDocuments: { type: Schema.Types.ObjectId, ref: 'Documents' },
    idGeneralInfo: { type: Schema.Types.ObjectId, ref: 'GeneralInfo' },
    idComercialInfo: { type: Schema.Types.ObjectId, ref: 'ComercialInfo' },
    credits: Array
}, { collection: 'Client' });

clientSchema.plugin(require('mongoose-autopopulate'));

var collectionName = 'Client';

module.exports = model('Client', clientSchema, collectionName);