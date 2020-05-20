const { Schema, model }= require('mongoose');

const referenceSchema = new Schema({
  name: String,
  phone: String,
  relative: String
}, { collection: 'Reference' });

var collectionName = 'Reference';

module.exports = model('Reference', referenceSchema, collectionName);