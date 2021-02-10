const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const finerioSchema = new Schema({
    idUser: { type: Schema.Types.ObjectId },
    idFinerio: String,
    credentials: Array,
    transactions: Array,
    registerDate: { type: Date, default: utc }
}, { collection: 'Finerio' });
  
var collectionName = 'Finerio';

module.exports = model('Finerio', finerioSchema, collectionName);