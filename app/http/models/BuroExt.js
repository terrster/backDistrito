const { Schema, model }= require('mongoose');

let now = new Date();
let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const buroExtSchema = new Schema({
    name: String,
    lastname : String,
    secondLastname : String,
    rfcPerson : String,
    phone : String,
    email : String,
    civilStatus : String,
    mortgageCredit : String,
    carCredit : String,
    creditCard : String,
    last4: String,
    tyc: Boolean,
    address: { type: Schema.Types.ObjectId, ref: 'Address', autopopulate: true },
    idBuro: { type: Schema.Types.ObjectId, ref: 'Buro', autopopulate: true  },
}, { collection: 'buroExt' });

buroExtSchema.plugin(require('mongoose-autopopulate'));

let collectionName = 'BuroExt';

module.exports = model('BuroExt', buroExtSchema, collectionName);