const mongoose = require('mongoose')
const USER_DB = process.env.USER_DB
const PASSWORD_DB =process.env.PASSWORD_DB 
const CLUSTER_MONGO = process.env.CLUSTER_MONGO
const url = (process.env.NODE_ENV === 'local') ? process.env.CLUSTER_MONGO: `mongodb+srv://${USER_DB}:${PASSWORD_DB}${CLUSTER_MONGO}`;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(db => console.log('database is connect'))
