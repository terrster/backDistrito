const { Schema, model }= require('mongoose');

let now = new Date();
let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const controlSchema = new Schema({
    name: { type: String, required: true },
    unykoo: { type: Boolean, default: false },
    userBuro: String,
    passwordBuro: String,
}, { collection: 'Control' });

let collectionName = 'Control';

module.exports = model('Control', controlSchema, collectionName);