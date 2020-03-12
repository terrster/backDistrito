 const { Schema, model }= require('mongoose');

const amountSchema = new Schema({
  idClient:  [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  howMuch: Number,
  whyNeed: String,
  whenNeed: String,
  term: Number,
  yearSales: Number,
  old: Number,
  registerDate: Date,
  status: Boolean,
}, { collection: 'Amount' });



var collectionName = 'Amount'

module.exports = model('Amount', amountSchema, collectionName)
