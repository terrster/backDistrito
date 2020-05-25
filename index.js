'use strict'

const app = require("./app/app");
const cronJobs = require("./app/cron/cronJobsController");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
}) 

//////database access configuration with environment variables
require('./config/database')

async function init() {
    await app.listen(`${process.env.PORT}`);
    console.log(`Server running on port ${process.env.PORT}`)
}

init()

//cronJobs.test();