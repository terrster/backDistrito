const { Schema, model }= require('mongoose');

const documentsSchema = new Schema({
    idClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    oficialID: Array,
    proofAddress: Array,
    bankStatements: Array,
    constitutiveAct: Array,
    otherActs: Array,
    financialStatements: Array,
    rfc: Array,
    status: Boolean,
    lastDeclarations: Array,
    acomplishOpinion: Array,
    facturacion: Array,
    others: Array,
    cventerprise:Array,
    proofAddressMainFounders: Array,
}, { collection: 'Documents' });



var collectionName = 'Documents'

module.exports = model('Documents', documentsSchema, collectionName)