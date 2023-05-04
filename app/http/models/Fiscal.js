const { books } = require('googleapis/build/src/apis/books');
const { Schema, model }= require('mongoose');

const fiscalSchema = new Schema({
    idClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    razonSocial: String,
    rfcMoral: String,
    rfcPerson: String,
    ciec: String,
    buroMoral: {
        documentId: String,
        firma: { type: Boolean, default: false },
        widgetId: String,
    },
    ciecStatus: { type: Boolean, default: false },
}, { collection: 'FiscalInfo' });

fiscalSchema.plugin(require('mongoose-autopopulate'));

var collectionName = 'FiscalInfo';

module.exports = model('FiscalInfo', fiscalSchema, collectionName);