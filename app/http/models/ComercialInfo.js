const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const comercialInfoSchema = new Schema({
  comercialName: String,
  businessName: String,
  gyre: String,
  rfc: String,
  specific:String,
  phone: String ,
  address: [{ type: Schema.Types.ObjectId, ref: 'Address', autopopulate: true }],
  registerDate: { type: Date, default: utc },
  webSite: String,
  facebook: String,
  terminal: Boolean,
  warranty: Boolean,
  status: { type: Boolean, default: false }
}, { collection: 'ComercialInfo' });

comercialInfoSchema.plugin(require('mongoose-autopopulate'));

var collectionName = 'ComercialInfo';

module.exports = model('ComercialInfo', comercialInfoSchema, collectionName);