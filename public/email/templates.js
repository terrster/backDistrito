'use strict'

const fs = require('fs');
const path = require("path");

const reset_password = (url) => {
 
    let html = fs.readFileSync(path.resolve("public/email/email_password.html"), 'utf8');
    let format = html.replace(/{url}/g, url);
    
    return format;
}

module.exports = {
    reset_password
}