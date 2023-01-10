const { Schema, model }= require('mongoose');

let now = new Date();
let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const buroSchema = new Schema({
    // idClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    date: { type: Date, default: utc},
    status: { type: Boolean, default: false },
    folio: String,
    score: String,
    scoreDate: Date,

}, { collection: 'Buro' });

module.exports = model('Buro', buroSchema, 'Buro');