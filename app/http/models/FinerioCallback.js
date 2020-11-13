const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const finerioSchema = new Schema({
    data: Array,
    dateCreated: { type: Date, default: utc }
}, { collection: 'FinerioCallback' });
  
var collectionName = 'FinerioCallback';

module.exports = model('FinerioCallback', finerioSchema, collectionName);