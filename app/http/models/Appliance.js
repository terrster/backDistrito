const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const applianceSchema = new Schema({
  idClient:  [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  idDocuments:  [{ type: Schema.Types.ObjectId, ref: 'Documents' }],
  idAmount: [{ type: Schema.Types.ObjectId, ref: 'Amount'}],
  idGeneralInfo:  [{ type: Schema.Types.ObjectId, ref: 'GeneralInfo' }],
  idComercialInfo:  [{ type: Schema.Types.ObjectId, ref: 'ComercialInfo' }],
  registerDate: { type: Date, default: utc },
  proposals: [{ type: Schema.Types.ObjectId, ref: 'Proposal' }],
  reason: String,
  tips: String,
  status: { type: Boolean, default: false }
}, { collection: 'Appliance' });

applianceSchema.plugin(require('mongoose-autopopulate'));

var collectionName = 'Appliance';

module.exports = model('Appliance', applianceSchema, collectionName);