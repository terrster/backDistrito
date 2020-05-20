const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const addressSchema = new Schema({
    street: String,
    extNumber: String,
    intNumber: String,
    town:String,
    zipCode:String,
    registerDate: { type: Date, default: utc }
}, { collection: 'Address' });

var collectionName = 'Address';

module.exports = model('Address', addressSchema, collectionName);