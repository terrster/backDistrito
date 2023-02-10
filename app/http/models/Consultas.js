const { Schema, model }= require('mongoose');

let now = new Date();
let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const consultasSchema = new Schema({
    folio: Number,
    fecha: { type: Date, default: utc},
    tipo: String,
    status: String,
    error: Object,
    referencia: String,
    resultado: Object,
    scoreValue: String,
}, { collection: 'Consultas' });

consultasSchema.plugin(require('mongoose-autopopulate'));

let collectionName = 'Consultas';

module.exports = model('Consultas', consultasSchema, collectionName);