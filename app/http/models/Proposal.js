const { Schema, model }= require('mongoose');

const proposalSchema = new Schema({
  idAppliance: [{ type: Schema.Types.ObjectId, ref: 'Appliance' }], 
  date: Date,
  file: String,
  fileName: String
}, { collection: 'Proposal' });

var collectionName = 'Proposal';

module.exports = model('Proposal', proposalSchema, collectionName);