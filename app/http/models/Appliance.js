const { Schema, model }= require('mongoose');

const applianceSchema = new Schema({
  idClient:  [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  idDocuments:  [{ type: Schema.Types.ObjectId, ref: 'Documents' }],
  idAmount: [{ type: Schema.Types.ObjectId, ref: 'Amount' }],
  idGeneralInfo:  [{ type: Schema.Types.ObjectId, ref: 'GeneralInfo' }],
  idComercialInfo:  [{ type: Schema.Types.ObjectId, ref: 'ComercialInfo' }],
  registerDate: Date,
  proposals: [{ type: Schema.Types.ObjectId, ref: 'Proposal' }],
  reason: String,
  tips: String,
  status: Boolean,
}, { collection: 'Appliance' });



var collectionName = 'Appliance'

module.exports = model('Appliance', applianceSchema, collectionName)