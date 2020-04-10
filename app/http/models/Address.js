const { Schema, model }= require('mongoose');

const addressSchema = new Schema({
    street: String,
    extNumber: String,
    intNumber: String,
    town:String,
    zipCode:String,
    registerDate: { type: Date, default: Date.now },
}, { collection: 'Address' });

var collectionName = 'Address'

module.exports = model('Address', addressSchema, collectionName)