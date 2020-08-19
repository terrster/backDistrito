'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-v2.finerio.mx/'
});
const finerioCredentials = require("../../../config/finerio_credentials");
const fs = require("fs");
const path = require("path");
const finerio_publicKey = fs.readFileSync(path.resolve("config/finerio_public.key"));
const crypto = require('crypto');
const moment = require("moment");

const User = require("../models/User");
const Finerio = require("../models/Finerio");

function Encrypt(payload){
    let buffer = Buffer.from(payload, 'utf8');
    let encrypted = crypto.publicEncrypt({key:finerio_publicKey, padding : crypto.constants.RSA_PKCS1_PADDING}, buffer)
    
    return encrypted.toString("base64");
}   

const finerioController = {
    test: (request, response) => {
        let transactions = {
            "data": [
                {
                    "id": 2463166,
                    "description": "DEPOSITO INTERBANCARIO AUT 427685",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 275,
                    "isCharge": false,
                    "date": 1590382800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 5332.27
                },
                {
                    "id": 2463165,
                    "description": "PAGO INTERBANCARIO AUT 460106",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 460106",
                    "amount": 15000,
                    "isCharge": true,
                    "date": 1590123600000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 5057.27
                },
                {
                    "id": 2463164,
                    "description": "DEPOSITO INTERBANCARIO AUT 959666",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 100,
                    "isCharge": false,
                    "date": 1590123600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 20057.27
                },
                {
                    "id": 2463163,
                    "description": "P TER 0000221293 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 221293",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 39750,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 19957.27
                },
                {
                    "id": 2463162,
                    "description": "DEPOSITO INTERBANCARIO AUT 198870",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 134,
                    "isCharge": false,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 59707.27
                },
                {
                    "id": 2463161,
                    "description": "PAGO INTERBANCARIO AUT 128016",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 128016",
                    "amount": 362.5,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 59573.27
                },
                {
                    "id": 2463160,
                    "description": "PAGO INTERBANCARIO AUT 126436",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 126436",
                    "amount": 37.5,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 59935.77
                },
                {
                    "id": 2463159,
                    "description": "DEPOSITO INTERBANCARIO AUT 97563",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 58698.9,
                    "isCharge": false,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 59973.27
                },
                {
                    "id": 2463158,
                    "description": "PAGO INTERBANCARIO AUT 100081",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 100081",
                    "amount": 1500,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 1274.37
                },
                {
                    "id": 2463157,
                    "description": "PAGO INTERBANCARIO AUT 99058",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 99058",
                    "amount": 10512.5,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 2774.37
                },
                {
                    "id": 2463156,
                    "description": "P TER 0000097695 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 97695",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 1440,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 13286.87
                },
                {
                    "id": 2463155,
                    "description": "PAGO INTERBANCARIO AUT 96880",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 96880",
                    "amount": 1087.5,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 14726.87
                },
                {
                    "id": 2463154,
                    "description": "PAGO INTERBANCARIO AUT 93895",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 93895",
                    "amount": 750,
                    "isCharge": true,
                    "date": 1589950800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 15814.37
                },
                {
                    "id": 2463153,
                    "description": "0000000000278290 PAGO A TERCEROS     278290 PAGO DE SERVI AUT. 278290",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 21620,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 16564.37
                },
                {
                    "id": 2463152,
                    "description": "0000000000276962 PAGO DE SERVICIO    276962 A TB 40530690 AUT. 276962",
                    "cleanedDescription": "PAGO DE SERVICIO",
                    "amount": 17142.27,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-00000000000c",
                    "duplicated": false,
                    "balance": 38184.37
                },
                {
                    "id": 2463151,
                    "description": "DEPOSITO INTERBANCARIO AUT 237664",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 960,
                    "isCharge": false,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 55326.64
                },
                {
                    "id": 2463150,
                    "description": "P TER 0000193400 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 193400",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 9666.66,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 54366.64
                },
                {
                    "id": 2463149,
                    "description": "0000000000191603 PAGO DE SERVICIO    191603 A TB 88229002 AUT. 191603",
                    "cleanedDescription": "PAGO DE SERVICIO",
                    "amount": 3377.34,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-00000000000c",
                    "duplicated": false,
                    "balance": 64033.3
                },
                {
                    "id": 2463148,
                    "description": "PAGO INTERBANCARIO AUT 170637",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 170637",
                    "amount": 325000,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 67410.64
                },
                {
                    "id": 2463147,
                    "description": "P TER 0000168114 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 168114",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 500000,
                    "isCharge": true,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 392410.64
                },
                {
                    "id": 2463146,
                    "description": "DEPOSITO INTERBANCARIO AUT 160944",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 825000,
                    "isCharge": false,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 892410.64
                },
                {
                    "id": 2463145,
                    "description": "DEPOSITO INTERBANCARIO AUT 127554",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 240,
                    "isCharge": false,
                    "date": 1589864400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 67410.64
                },
                {
                    "id": 2463144,
                    "description": "DEPOSITO INTERBANCARIO AUT 685866",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 330,
                    "isCharge": false,
                    "date": 1589778000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 67170.64
                },
                {
                    "id": 2463143,
                    "description": "P TER 0000207402 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 207402",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 500000,
                    "isCharge": true,
                    "date": 1589778000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 66840.64
                },
                {
                    "id": 2463142,
                    "description": "0000000000198636 PAGO A TERCEROS     198636 PAGO DE SERVI AUT. 198636",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 624,
                    "isCharge": true,
                    "date": 1589778000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 566840.64
                },
                {
                    "id": 2463141,
                    "description": "DEPOSITO INTERBANCARIO AUT 554262",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 560000,
                    "isCharge": false,
                    "date": 1589778000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 567464.64
                },
                {
                    "id": 2463140,
                    "description": "PAGO INTERBANCARIO AUT 529479",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 529479",
                    "amount": 400000,
                    "isCharge": true,
                    "date": 1589518800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 7464.64
                },
                {
                    "id": 2463139,
                    "description": "PAGO INTERBANCARIO AUT 524439",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 524439",
                    "amount": 71941.08,
                    "isCharge": true,
                    "date": 1589518800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 407464.64
                },
                {
                    "id": 2463138,
                    "description": "PAGO INTERBANCARIO AUT 517835",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 517835",
                    "amount": 72000,
                    "isCharge": true,
                    "date": 1589518800000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 479405.72
                },
                {
                    "id": 2463136,
                    "description": "DEPOSITO INTERBANCARIO AUT 111696",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 550000,
                    "isCharge": false,
                    "date": 1589518800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 551405.72
                },
                {
                    "id": 2463134,
                    "description": "DEPOSITO INTERBANCARIO AUT 282995",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 600,
                    "isCharge": false,
                    "date": 1589346000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 1405.72
                },
                {
                    "id": 2463132,
                    "description": "DEPOSITO INTERBANCARIO AUT 633992",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 100,
                    "isCharge": false,
                    "date": 1589173200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 805.72
                },
                {
                    "id": 2463130,
                    "description": "DEPOSITO INTERBANCARIO AUT 186673",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 363,
                    "isCharge": false,
                    "date": 1588914000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 705.72
                },
                {
                    "id": 2463128,
                    "description": "PAGO INTERBANCARIO AUT 333595",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 333595",
                    "amount": 1000,
                    "isCharge": true,
                    "date": 1588914000000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 342.72
                },
                {
                    "id": 2463126,
                    "description": "0000000000332943 PAGO A TERCEROS     332943 PAGO DE SERVI AUT. 332943",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 960,
                    "isCharge": true,
                    "date": 1588914000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 1342.72
                },
                {
                    "id": 2463124,
                    "description": "DEPOSITO INTERBANCARIO AUT 35015",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 474,
                    "isCharge": false,
                    "date": 1588914000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 2302.72
                },
                {
                    "id": 2463122,
                    "description": "0000000000187509 PAGO A TERCEROS     187509 PAGO DE SERVI AUT. 187509",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 1000,
                    "isCharge": true,
                    "date": 1588827600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 1828.72
                },
                {
                    "id": 2463120,
                    "description": "P TER 0000186604 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 186604",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 718.5,
                    "isCharge": true,
                    "date": 1588827600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 2828.72
                },
                {
                    "id": 2463118,
                    "description": "DEPOSITO INTERBANCARIO AUT 451732",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 470,
                    "isCharge": false,
                    "date": 1588741200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 3547.22
                },
                {
                    "id": 2463116,
                    "description": "DEPOSITO INTERBANCARIO AUT 345127",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 150,
                    "isCharge": false,
                    "date": 1588741200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 3077.22
                },
                {
                    "id": 2463114,
                    "description": "0000000009331701 DOMI 0009331701 BMW FS AUT. 334347",
                    "cleanedDescription": "DOMI 0009331701 BMW FS",
                    "amount": 4597.35,
                    "isCharge": true,
                    "date": 1588568400000,
                    "categoryId": "00000000-0000-0000-0000-000000000023",
                    "duplicated": false,
                    "balance": 2927.22
                },
                {
                    "id": 2463112,
                    "description": "DEPOSITO INTERBANCARIO AUT 958613",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 180,
                    "isCharge": false,
                    "date": 1588568400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7524.57
                },
                {
                    "id": 2463110,
                    "description": "DEPOSITO INTERBANCARIO AUT 826978",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 150,
                    "isCharge": false,
                    "date": 1588568400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7344.57
                },
                {
                    "id": 2463108,
                    "description": "0000000000245957 PAGO A TERCEROS     245957 PAGO DE SERVI AUT. 245957",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 2500,
                    "isCharge": true,
                    "date": 1588568400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7194.57
                },
                {
                    "id": 2463106,
                    "description": "DEPOSITO INTERBANCARIO AUT 105414",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 1000,
                    "isCharge": false,
                    "date": 1588222800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 9694.57
                },
                {
                    "id": 2463104,
                    "description": "DEPOSITO INTERBANCARIO AUT 967327",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 260,
                    "isCharge": false,
                    "date": 1588222800000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8694.57
                },
                {
                    "id": 2463102,
                    "description": "DEPOSITO INTERBANCARIO AUT 184109",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 432,
                    "isCharge": false,
                    "date": 1588136400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8434.57
                },
                {
                    "id": 2463100,
                    "description": "DEPOSITO INTERBANCARIO AUT 679063",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 315.52,
                    "isCharge": false,
                    "date": 1587963600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8002.57
                },
                {
                    "id": 2463098,
                    "description": "DEPOSITO INTERBANCARIO AUT 510418",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 280,
                    "isCharge": false,
                    "date": 1587963600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7687.05
                },
                {
                    "id": 2463074,
                    "description": "DEPOSITO INTERBANCARIO AUT 664839",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 23751,
                    "isCharge": false,
                    "date": 1592370000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 35466.83
                },
                {
                    "id": 2463073,
                    "description": "PAGO INTERBANCARIO AUT 318142",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 318142",
                    "amount": 300000,
                    "isCharge": true,
                    "date": 1592370000000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 11715.83
                },
                {
                    "id": 2463072,
                    "description": "DEPOSITO INTERBANCARIO AUT 653069",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 300000,
                    "isCharge": false,
                    "date": 1592370000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 311715.83
                },
                {
                    "id": 2463071,
                    "description": "DEPOSITO INTERBANCARIO AUT 671568",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 1080,
                    "isCharge": false,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 11715.83
                },
                {
                    "id": 2463070,
                    "description": "0000000000288025 PAGO DE SERVICIO    288025 A TB 40530690 AUT. 288025",
                    "cleanedDescription": "PAGO DE SERVICIO",
                    "amount": 5000,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-00000000000c",
                    "duplicated": false,
                    "balance": 10635.83
                },
                {
                    "id": 2463069,
                    "description": "PAGO INTERBANCARIO AUT 286204",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 286204",
                    "amount": 9301.48,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 15635.83
                },
                {
                    "id": 2463068,
                    "description": "PAGO INTERBANCARIO AUT 284363",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 284363",
                    "amount": 795,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 24937.31
                },
                {
                    "id": 2463067,
                    "description": "0000000000278434 PAGO A TERCEROS     278434 PAGO DE SERVI AUT. 278434",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 624,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 25732.31
                },
                {
                    "id": 2463066,
                    "description": "DEPOSITO INTERBANCARIO AUT 581710",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 920,
                    "isCharge": false,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 26356.31
                },
                {
                    "id": 2463065,
                    "description": "P TER 0000246472 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 246472",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 169740.5,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 25436.31
                },
                {
                    "id": 2463064,
                    "description": "PAGO INTERBANCARIO AUT 243120",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 243120",
                    "amount": 170000,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 195176.81
                },
                {
                    "id": 2463063,
                    "description": "P TER 0000232723 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 232723",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 500000,
                    "isCharge": true,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 365176.81
                },
                {
                    "id": 2463062,
                    "description": "DEPOSITO INTERBANCARIO AUT 521590",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 850000,
                    "isCharge": false,
                    "date": 1592283600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 865176.81
                },
                {
                    "id": 2463061,
                    "description": "0000000000803847 PAGO DE SERVICIO    803847 A TB 88229002 AUT. 803847",
                    "cleanedDescription": "PAGO DE SERVICIO",
                    "amount": 3371.79,
                    "isCharge": true,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-00000000000c",
                    "duplicated": false,
                    "balance": 15176.81
                },
                {
                    "id": 2463060,
                    "description": "P TER 0000797869 FRANCISCO JAVIER,URIBE/GOMEZ AUT. 797869",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 9666.66,
                    "isCharge": true,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 18548.6
                },
                {
                    "id": 2463059,
                    "description": "DEPOSITO INTERBANCARIO AUT 738802",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 15000,
                    "isCharge": false,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 28215.26
                },
                {
                    "id": 2463058,
                    "description": "0000000000000000 RETIRO POR TRASPASO AUT. 661013",
                    "cleanedDescription": "TRASPASO",
                    "amount": 3120,
                    "isCharge": true,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-00000000002f",
                    "duplicated": false,
                    "balance": 13215.26
                },
                {
                    "id": 2463057,
                    "description": "DEPOSITO INTERBANCARIO AUT 563737",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 7500,
                    "isCharge": false,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 16335.26
                },
                {
                    "id": 2463056,
                    "description": "DEPOSITO INTERBANCARIO AUT 359958",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 175,
                    "isCharge": false,
                    "date": 1592197200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8835.26
                },
                {
                    "id": 2463055,
                    "description": "DEPOSITO INTERBANCARIO AUT 997772",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 125,
                    "isCharge": false,
                    "date": 1591938000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8660.26
                },
                {
                    "id": 2463054,
                    "description": "DEPOSITO INTERBANCARIO AUT 461102",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 695,
                    "isCharge": false,
                    "date": 1591765200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 8535.26
                },
                {
                    "id": 2463053,
                    "description": "DEPOSITO INTERBANCARIO AUT 352755",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 500,
                    "isCharge": false,
                    "date": 1591765200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7840.26
                },
                {
                    "id": 2463052,
                    "description": "DEPOSITO INTERBANCARIO AUT 13986",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 2000,
                    "isCharge": false,
                    "date": 1591592400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 7340.26
                },
                {
                    "id": 2463051,
                    "description": "DEPOSITO INTERBANCARIO AUT 913037",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 363,
                    "isCharge": false,
                    "date": 1591592400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 5340.26
                },
                {
                    "id": 2463050,
                    "description": "PAGO INTERBANCARIO AUT 325108",
                    "cleanedDescription": "PAGO INTERBANCARIO AUT 325108",
                    "amount": 1500,
                    "isCharge": true,
                    "date": 1591592400000,
                    "categoryId": "00000000-0000-0000-0000-000000000045",
                    "duplicated": false,
                    "balance": 4977.26
                },
                {
                    "id": 2463049,
                    "description": "0000000000243143 PAGO A TERCEROS     243143 PAGO DE SERVI AUT. 243143",
                    "cleanedDescription": "PAGO A TERCEROS",
                    "amount": 4455,
                    "isCharge": true,
                    "date": 1591592400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 6477.26
                },
                {
                    "id": 2463048,
                    "description": "DEPOSITO INTERBANCARIO AUT 847138",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 160,
                    "isCharge": false,
                    "date": 1591333200000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 10932.26
                },
                {
                    "id": 2463047,
                    "description": "DEPOSITO INTERBANCARIO AUT 219756",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 260,
                    "isCharge": false,
                    "date": 1591160400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 10772.26
                },
                {
                    "id": 2463046,
                    "description": "DEPOSITO INTERBANCARIO AUT 994240",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 250,
                    "isCharge": false,
                    "date": 1591074000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 10512.26
                },
                {
                    "id": 2463045,
                    "description": "DEPOSITO INTERBANCARIO AUT 861113",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 400,
                    "isCharge": false,
                    "date": 1591074000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 10262.26
                },
                {
                    "id": 2463044,
                    "description": "DEPOSITO INTERBANCARIO AUT 463121",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 8000,
                    "isCharge": false,
                    "date": 1590987600000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 9862.26
                },
                {
                    "id": 2463043,
                    "description": "0000000002178971 DOMI 0002178971 BMW FS AUT. 492933",
                    "cleanedDescription": "DOMI 0002178971 BMW FS",
                    "amount": 4595.01,
                    "isCharge": true,
                    "date": 1590987600000,
                    "categoryId": "00000000-0000-0000-0000-000000000023",
                    "duplicated": false,
                    "balance": 1862.26
                },
                {
                    "id": 2463042,
                    "description": "DEPOSITO INTERBANCARIO AUT 508447",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 175,
                    "isCharge": false,
                    "date": 1590728400000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 6457.27
                },
                {
                    "id": 2463041,
                    "description": "DEPOSITO INTERBANCARIO AUT 455987",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 450,
                    "isCharge": false,
                    "date": 1590642000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 6282.27
                },
                {
                    "id": 2463040,
                    "description": "DEPOSITO INTERBANCARIO AUT 302738",
                    "cleanedDescription": "DEPOSITO",
                    "amount": 500,
                    "isCharge": false,
                    "date": 1590642000000,
                    "categoryId": "00000000-0000-0000-0000-000000000049",
                    "duplicated": false,
                    "balance": 5832.27
                }
            ],
            "nextCursor": null
        };

        let map = {};

        function getCharge(type){
            return type ? 'cargo' : 'deposito';
        }

        for(const transaction of transactions.data){
            var date = moment(transaction.date).format('DD/MM/YYYY'); 
            var year = moment(transaction.date).format("YYYY");
            var month = moment(transaction.date).format("M");
            var typeCharge = getCharge(transaction.isCharge);

            transaction.date = date;

            if(Object.keys(map).length === 0){
                map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
            }
            else{
                if(map[year]){//Year exist
                    if(map[year].data[month]){//Month exist in year
                        if(Object.keys(map[year].data[month][typeCharge]).length === 0){
                            map[year].data[month][typeCharge][0] = transaction;  
                        }
                        else{
                            let index = Object.keys(map[year].data[month][typeCharge])[Object.keys(map[year].data[month][typeCharge]).length - 1];
                            map[year].data[month][typeCharge][parseInt(index) + 1] = transaction;
                        }
                    }
                    else{//Add month to year
                        map[year].data[month] = { [typeCharge] : [transaction]};
                        map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                    }
                }
                else{//Add year and month
                    map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                    map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                }
            }
        }

        let currentYear = new Date().getFullYear();

        function getLastTransaction(year){
            let ilt_month = Object.keys(map[year].data)[Object.keys(map[year].data).length - 1];
            let ilt_dep = Object.keys(map[year].data[ilt_month].deposito)[Object.keys(map[year].data[ilt_month].deposito).length - 1];
            let ilt_car = Object.keys(map[year].data[ilt_month].cargo)[Object.keys(map[year].data[ilt_month].cargo).length - 1];

            let index = transactions.data.findIndex(transactions => transactions.id === map[year].data[ilt_month].deposito[ilt_dep].id);
            let index2 = transactions.data.findIndex(transactions => transactions.id === map[year].data[ilt_month].cargo[ilt_car].id);

            return index > index2 ? map[year].data[ilt_month].deposito[ilt_dep] : map[year].data[ilt_month].cargo[ilt_car];
        }

        map[currentYear]['last_transaction'] = getLastTransaction(currentYear);

        if(map[currentYear - 1]){
            map[currentYear - 1]['last_transaction'] = getLastTransaction(currentYear - 1);

            if(map[currentYear - 2]){
                map[currentYear - 2]['last_transaction'] = getLastTransaction(currentYear - 2);
            }
        }
        
        return response.json({
            "data": map
        });        
    },
    //Banks
    getBanks: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get('banks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let banks = [];
            data.forEach(bank => {
                if(bank.name !== 'American Express' && bank.name !== 'Liverpool' && bank.name !== 'Banregio'){
                    banks.push(bank);
                }
            });

            return response.json(banks);
        }
        catch(error){
            let err = {
                msg: "Finerio: Algo salió mal tratando de obtener los bancos.",
                error: error.response.data.errors
            };

            return response.json(err);
        };
    },
    getBank: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`banks/${request.params.id}/fields`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener los datos de un banco.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'financialInstitution.not.found'){
                err = {
                    msg: "Finerio: La institución bancaria no ha sido encontrada."
                }
            }

            return response.json(err);
        }
    },
    //Customers
    storeCustomer: async(email) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.post('customers', {
                name: email
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // return response.json({
            //     msg: "Finerio: Cliente creado correctamente.",
            //     data
            // });
            return {
                code: 200,
                msg: "Finerio: Cliente creado correctamente.",
                data
            };
        }
        catch(error){
            var err = {
                code: 500,
                msg: "Algo salió mal tratando de registrar una credencial.",
                error: error.response.data
            };

            if(error.response.status == 400 && error.response.data.errors[0].code === 'customer.name.null'){
                err = {
                    msg: "Finerio: No se ha proveído un identificador name."
                };
            }
            
            if(error.response.status == 400 && error.response.data.errors[0].code === 'customer.create.name.exists'){
                err = {
                    code: 400,
                    msg: "Finerio: El identificador name ya ha sido registrado."
                };
            }
            console.log(err);
            //return response.json(err);
            return err;
        }
    },
    getCustomers: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get('customers', {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            let err = {
                msg: "Finerio: Algo salió mal tratando de obtener los clientes.",
                error: error.response.data
            };

            return response.json(err);
        }
    },
    getCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la información de un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    updateCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.put(`customers/${request.params.id}`, {
                'name': request.body.name
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json({
                msg: "Finerio: Cliente actualizado correctamente.",
                data
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            if(error.response.status == 400 && error.response.data.errors[0].code == 'customer.create.name.exists'){
               err = {
                    msg: "Finerio: El identificador name ya ha sido registrado."
               };
            }

            return response.json(err);
        }
    },
    deleteCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.delete(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json({
                msg: "Finerio: Cliente eliminado correctamente."
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de eliminar un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    //Credentials
    storeCredential: async(request) => {
        try{
            let { customerId, bankId, username, password, securityCode } = request;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                //return response.json(res);
                return res;
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;

            let token = await finerioCredentials.getToken();
            let result = await axios.post('credentials', {
                'customerId': customerId,
                'bankId': bankId,
                'username': usernameEncrypted,
                'password': passwordEncrypted,
                'securityCode': securityCodeEncrypted
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if(result.status == 201 && result.data.status == 'VALIDATE'){
                let res = {
                    msg: "Finerio: La credencial ha sido guardada correctamente, pendiente a validación.",
                    data: result.data
                };

                //return response.json(res);
                return res;
            }
        }
        catch(error){ console.log(error)
            var err = {
                msg: "Finerio: Algo salió mal tratando de registrar una credencial.",
                error: error.response.data
            };

            if(error.response.status == 400 && error.response.data.errors[0].code == 'credential.create.exists'){
                err = {
                    msg: "Finerio: La credencial ya existe."
                };
            }

            //return response.json(err);
            return err;
        }
    },
    getCredentials: async(request, response) => {//ID CUSTOMER
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`credentials?customerId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener las credenciales del cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    getCredential: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salío mal tratando de obtener la credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return response.json(err);
        }
    },
    updateCredential: async(request) => {
        try{
            let { customerId, idCredential, bankId, username, password, securityCode } = request;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                //return response.json(res);
                return res;
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;

            let token = await finerioCredentials.getToken();
            let result = await axios.put(`credentials/${idCredential}`, {
                'customerId': customerId,
                'bankId': bankId,
                'username': usernameEncrypted,
                'password': passwordEncrypted,
                'securityCode': securityCodeEncrypted
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(result.status == 204){
                let res = {
                    msg: "Finerio: La credencial ha sido actualizada correctamente, pendiente a validación."
                };

                //return response.json(res);
                return res;
            }
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de una credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada.",
                };
            }

            //return response.json(err);
            return err;
        }
    },
    deleteCredential: async(request, response) => {
        try{
            let idUser = request.headers.tokenDecoded.data.id;
            let token = await finerioCredentials.getToken();
            let result = await axios.delete(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let user = await User.findById(idUser);
            let credentials = user.idClient.appliance[0].idFinerio.credentials;
            let index = credentials.findIndex(c => c.id === request.params.id);
            const newCredentials = credentials.splice(index, index);

            await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: newCredentials});
            user = await User.findById(idUser);

            if(result.status == 204){
                return response.json({
                    msg: "Finerio: Credencial eliminada correctamente.",
                    user: user 
                });
            }
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de eliminar una credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada.",
                }
            }

            return response.json(err);
        }
    },
    //Accounts
    getAccounts: async(request, response) => {//ID Credential
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts?credentialId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener las cuentas.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return response.json(err);
        }
    },
    getAccount: async(request, response) => {//ID Account
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts/${request.params.id}/details`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return responese.json(err);
        }
    },
    //Transactions
    getTransactions: async(request, response) => {//ID Account
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`transactions?accountId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(data.data == ''){
                return response.json({
                    msg: "Finerio: No hay transacciones que mostrar.",
                    result: data
                });
            }

            let transactions = data;
            let map = {};

            function getCharge(type){
                return type ? 'cargo' : 'deposito';
            }

            for(const transaction of transactions.data){
                var date = moment(transaction.date).format('DD/MM/YYYY'); 
                var year = moment(transaction.date).format("YYYY");
                var month = moment(transaction.date).format("M");
                var typeCharge = getCharge(transaction.isCharge);

                transaction.date = date;

                if(Object.keys(map).length === 0){
                    map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                    map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                }
                else{
                    if(map[year]){//Year exist
                        if(map[year].data[month]){//Month exist in year
                            if(Object.keys(map[year].data[month][typeCharge]).length === 0){
                                map[year].data[month][typeCharge][0] = transaction;  
                            }
                            else{
                                let index = Object.keys(map[year].data[month][typeCharge])[Object.keys(map[year].data[month][typeCharge]).length - 1];
                                map[year].data[month][typeCharge][parseInt(index) + 1] = transaction;
                            }
                        }
                        else{//Add month to year
                            map[year].data[month] = { [typeCharge] : [transaction]};
                            map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                        }
                    }
                    else{//Add year and month
                        map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                        map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                    }
                }
            }

            let currentYear = new Date().getFullYear();

            function getLastTransaction(year){
                let ilt_month = Object.keys(map[year].data)[Object.keys(map[year].data).length - 1];
                let ilt_dep = Object.keys(map[year].data[ilt_month].deposito)[Object.keys(map[year].data[ilt_month].deposito).length - 1];
                let ilt_car = Object.keys(map[year].data[ilt_month].cargo)[Object.keys(map[year].data[ilt_month].cargo).length - 1];

                let index = transactions.data.findIndex(transactions => transactions.id === map[year].data[ilt_month].deposito[ilt_dep].id);
                let index2 = transactions.data.findIndex(transactions => transactions.id === map[year].data[ilt_month].cargo[ilt_car].id);

                return index > index2 ? map[year].data[ilt_month].deposito[ilt_dep] : map[year].data[ilt_month].cargo[ilt_car];
            }

            map[currentYear]['last_transaction'] = getLastTransaction(currentYear);

            if(map[currentYear - 1]){
                map[currentYear - 1]['last_transaction'] = getLastTransaction(currentYear - 1);

                if(map[currentYear - 2]){
                    map[currentYear - 2]['last_transaction'] = getLastTransaction(currentYear - 2);
                }
            }

            return response.json({
                "transactions": map
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error.response.data
            };

            return response.json(err);
        }
    },
    getAllTransactions: async(request, response) => {//ID User
        let idUser = request.headers.tokenDecoded.data.id;

        try{
            let user = await User.findById(idUser);
            let token = await finerioCredentials.getToken();

            let credentials = user.idClient.appliance[0].idFinerio.credentials;
            let accounts = [];
            for await(let credential of credentials){

                let accountsRsp = await axios.get(`accounts?credentialId=${credential.id}`, {    
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });


                for await(let account of accountsRsp.data.data){
                    if(account.type == 'Cheques'){
                        account.crecentialId = credential.id;
                        accounts.push(account);
                    }
                }

            }

            let transactions = [];

            for await(let account of accounts){
                try{
                    let {data} = await axios.get(`transactions?accountId=${account.id}`, {    
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
        
                    
                    transactions.push({
                        idCredential: account.crecentialId,
                        transactions: data.data
                    });
        
                    //transactions.push({data});
                }
                catch(error){
                    transactions.push({
                        idCredential: credential.id,
                        transactions: []
                    });
                }
                
            }

            return response.json({
                transactions
            });

        }
        catch(error){
            console.log(error);
        }
    }
};

module.exports = finerioController;