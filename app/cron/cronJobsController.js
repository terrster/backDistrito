'use strict'

/*
|--------------------------------------------------------------------------
| Cron Jobs
|--------------------------------------------------------------------------
|  * * * * * *
|  | | | | | |
|  | | | | | day of week
|  | | | | month
|  | | | day of month
|  | | hour
|  | minute
|  second ( optional ) /s
*/

const cron = require("node-cron");
const moment = require("moment");
const timezone = "America/Mexico_City";

moment.locale('es');

var job = {

    test: () => {
        //job.seconds();
        job.minutes();
    },
    seconds: (active = true) => {
        cron.schedule("* * * * * *", () => {
            var time = moment().format('hh:mm:ss a'); 
            console.log("running a task every second " + time);
        }, null, true, timezone);
    },
    minutes: (actuve = true) => {        
        cron.schedule("*/2 * * * *", () => {
            var time = moment().format('hh:mm:ss a');  
            console.log("running a task every two minutes " + time);
        }, null, true, timezone);
    }
}

module.exports = job;