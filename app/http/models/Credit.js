const { Schema, model }= require('mongoose');

const creditSchema = new Schema({
    idClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    amount: String,
    term: Number,
    reason: String,
    whenNeed: String,
    expiresDate: Date,
    date: Date
}, { collection: 'Credit' });

var collectionName = 'Credit';

module.exports = model('Credit', creditSchema, collectionName);