const { Schema, model }= require('mongoose');

const addressSchema = new Schema({
    street: String,
    extNumber: String,
    intNumber: String,
    town:String,
    zipCode:String,
    registerDate: Date,
}, { collection: 'Address' });

var collectionName = 'Address'

module.exports = model('Address', addressSchema, collectionName)