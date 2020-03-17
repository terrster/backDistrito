const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    idClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    name: { type: String, default: ''},
    lastName: { type: String, default: '' },
    access: { type:  String, default: '' },
    email: { type: String, default: ''},
    password: { type: String, default: ''},
    phone: { type: String, default: ''},
    registerDate: { type: Date, default: '' },
    address: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    hubspotContactId: { type: String, default: ''},
    hubspotDealId: { type: String, default: ''},
    recoverPassHash: { type: String, default: ''},
    idDistrito: { type: Number },
    createdAt: { type: Date },
}, { collection: 'User' });

userSchema.methods.encryptPassword = async (password) => {
    return bcrypt.hash(password, 12);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

var collectionName = 'User'

module.exports = model('User', userSchema, collectionName)