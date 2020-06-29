const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

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
    address: [{ type: Schema.Types.ObjectId, ref: 'Address', autopopulate: true }],
    mortgageCredit: Boolean,
    carCredit: String,
    creditCard: Boolean,
    registerDate: { type: Date, default: utc },
    contactWith: [{ type: Schema.Types.ObjectId, ref: 'Reference', autopopulate: true }],
    last4: String,
    tyc: { type: Boolean, default: false },
    status: { type: Boolean, default: false }
}, { collection: 'GeneralInfo' });

generalInfoSchema.plugin(require('mongoose-autopopulate'));

var collectionName = 'GeneralInfo';

module.exports = model('GeneralInfo', generalInfoSchema, collectionName);
