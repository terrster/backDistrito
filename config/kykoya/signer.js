'use strict'

const crypto = require('crypto-js');
const appId = "eae1f759-2317-492f-9007-d364d76cdeb2";
const appSecret = "4olYVodlZSqh4blFjxlBgA5xHvpDok1AtoYmonEKMqnoX0XEaFoXjprpASKHH4QNu5LJ3WpN0lZUFs4ILqrtVA==";

const signRequest = (method, requestURI) => {
    let timestamp = (new Date).toUTCString();
    let canonicalString = [
        method,
        'application/vnd.api+json',
        '',
        `/api/v1/${requestURI}`,
        timestamp
    ].join(',');
    let signature = crypto
    .HmacSHA256(canonicalString, appSecret)
    .toString(crypto.enc.Base64);

    return {
        'Authorization': `APIAuth-HMAC-SHA256 ${appId}:${signature}`,
        'Date': timestamp,
        'Content-Type': 'application/vnd.api+json'
    };
}


module.exports = {
    signRequest
}
