const { Schema, model }= require('mongoose');

let now = new Date();
let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const buroSchema = new Schema({
    // idClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    date: { type: Date, default: utc},
    status: { type: Boolean, default: false },
    moralStatus: { type: Boolean, default: false },
    consultas: [{ type: Schema.Types.ObjectId, ref: 'Consultas', autopopulate: true }],
}, { collection: 'Buro' });

buroSchema.plugin(require('mongoose-autopopulate'));

let collectionName = 'Buro';

module.exports = model('Buro', buroSchema, collectionName);