'use strict'

const mongoose = require("mongoose")
const app = require("./app/app");
const cronJobs = require("./app/cron/cronJobsController");

require('dotenv').config({path: 'environment.env'});
const db = process.env.DB_PROD || process.env.DB_DEV;
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3900;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
    console.log('La conexión a la base de datos se ha realizado correctamente!');
    
    app.listen(port, host, () => {
        console.log(`Servidor corriendo en http://${host}:` + port);
    });
});



//cronJobs.test();