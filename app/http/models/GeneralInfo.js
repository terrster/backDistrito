const { Schema, model }= require('mongoose');

const generalInfoSchema = new Schema({
    idClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    civilStatus: String,
    rfcPerson: String,
    name: String,
    secondLastname: String,
    lastname: String,
    birthDate: String,
    ciec: String,
    phone: String,
    address: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    mortgageCredit: Boolean,
    carCredit: String,
    creditCard: Boolean,
    registerDate: Date,
    contactWith: [{ type: Schema.Types.ObjectId, ref: 'Reference' }],
    last4: String,
    status: Boolean,
}, { collection: 'GeneralInfo' });

var collectionName = 'GeneralInfo'

module.exports = model('GeneralInfo', generalInfoSchema, collectionName)