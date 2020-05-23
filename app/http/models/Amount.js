const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const amountSchema = new Schema({
  idClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  howMuch: Number,
  whyNeed: String,
  whenNeed: String,
  term: Number,
  yearSales: Number,
  old: String,
  registerDate: { type: Date, default: utc},
  status: { type: Boolean, default: false }
}, { collection: 'Amount' });

var collectionName = 'Amount';

module.exports = model('Amount', amountSchema, collectionName);
