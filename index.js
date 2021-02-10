'use strict'

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

const server = require('./config/server');

new server().initialize();

// const port = process.env.PORT;
// const server = http.createServer(app);

//////database access configuration with environment variables
// require('./config/database')

// async function init() {
//     // await app.listen(`${process.env.PORT}`);
//     // console.log(`Server running on port ${process.env.PORT}`)
//     await server.listen(port, () => {
//         console.log(`Server running on port: ${port}`);
//         // app.set('io', new socket(server));
//         global.io = new socket(server);
//         console.log(`Socket service initialized successfully`);
//     });
// }

// init()

//cronJobs.test();