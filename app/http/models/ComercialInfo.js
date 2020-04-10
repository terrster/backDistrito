const { Schema, model }= require('mongoose');

const comercialInfoSchema = new Schema({
  comercialName: String,
  businessName: String,
  gyre: String,
  rfc: String,
  specific:String,
  phone: String ,
  address: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  registerDate: { type: Date, default: Date.now },
  webSite: String ,
  facebook: String ,
  terminal: Boolean ,
  warranty: Boolean ,
  status: Boolean ,
}, { collection: 'ComercialInfo' });



var collectionName = 'ComercialInfo'

module.exports = model('ComercialInfo', comercialInfoSchema, collectionName)