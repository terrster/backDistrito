const { Schema, model }= require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: { type: String, default: ''},
    lastName: { type: String, default: '' },
    access: { type:  String, default: '' },
    email: { type: String, default: ''},
    password: { type: String, default: ''},
    phone: { type: String, default: ''},
    registerDate: { type: Date, default: '' },
    address: {},
    hubspotContactId: { type: String, default: ''},
    hubspotDealId: { type: String, default: ''},
    recoverPassHash: { type: String, default: ''},
    idDistrito: { type: Number },
    createdAt: { type: Date },
    idClient: { type: String, default: '' },
}, { collection: 'User' });

userSchema.methods.encryptPassword = async (password) => {
    return bcrypt.hash(password, 12);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

var collectionName = 'User'

module.exports = model('User', userSchema, collectionName)