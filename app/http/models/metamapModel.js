const { Schema, model }= require('mongoose');

var now = new Date();
var utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

const metaschema = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'User'},
    verefication: {
        flow_id: String,
        token: String,
        toke_expiration: String,
        status: String,
    }
}, { collection: 'Meta' });

metaschema.plugin(require('mongoose-autopopulate'));

metaschema.methods.token_expiration = function(){
    let now = new Date();
    let utc = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return utc;
}

metaschema.methods.token = function(){
    let token = Math.random().toString(36).substr(2);
    let token_expiration = this.token_expiration();
    return token;
}


var collectionName = 'Meta';

module.exports = model('Meta', metaschema, collectionName);