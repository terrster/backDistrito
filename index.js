'use strict'

const app = require("./app/app");
const cronJobs = require("./app/cron/cronJobsController");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
}) 

//////database access configuration with environment variables
require('./config/database')

async function init() {
    await app.listen(3900);
    console.log('server on port 3900')
}

init()

cronJobs.test();