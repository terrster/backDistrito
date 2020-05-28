const { Schema, model } = require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const passwordResets_Schema = new Schema({
    email: String,
    recoverPassHash: String,
    createdAt: { type: Date, default: utc },
}, { collection: 'PasswordsResets' });

var collectionName = 'PasswordsResets';

module.exports = model('PasswordsResets', passwordResets_Schema, collectionName);