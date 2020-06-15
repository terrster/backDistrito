const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const userSchema = new Schema({
    idClient: [{ type: Schema.Types.ObjectId, ref: 'Client', autopopulate: true }],
    name: String,
    lastName: String,
    secondLastname: String,
    access: { type:  String, default: 'USER' },
    email: { type: String, index: true, unique: true, required: true, uniqueCaseInsensitive: true },
    password: String,
    phone: String,
    registerDate: { type: Date, default: utc },
    address: [{ type: Schema.Types.ObjectId, ref: 'Address', autopopulate: true }],
    hubspotContactId: String,
    hubspotDealId: String,
    recoverPassHash: String,
    idDistrito: Number,
    createdAt: { type: Date, default: utc }
}, { collection: 'User' });

userSchema.plugin(require('mongoose-unique-validator'));
userSchema.plugin(require('mongoose-autopopulate'));

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    if(this._update.password){
        this._update.password = await bcrypt.hash(this._update.password, 12);
    }
    next();
});

var collectionName = 'User';

module.exports = model('User', userSchema, collectionName);