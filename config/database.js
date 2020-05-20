const mongoose = require('mongoose')

///////////Environment Variables
const USER_DB = process.env.USER_DB
const PASSWORD_DB =process.env.PASSWORD_DB 
const CLUSTER_MONGO = process.env.CLUSTER_MONGO

////////////generate connection url
const url = (process.env.NODE_ENV === 'local')
                ? process.env.CLUSTER_MONGO 
                : `mongodb+srv://${USER_DB}:${PASSWORD_DB}${CLUSTER_MONGO}`;

mongoose.set('useFindAndModify', false);
mongoose.connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(db => console.log('Database is connected'))
