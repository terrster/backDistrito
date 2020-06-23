'use strict'

const axios = require("axios");
const querystring = require('querystring');

let authorization = {
    client_id: 'AcFLCdKUrT3nQ8npapPyfB5nd3f4LbEEPxwBB6VLRVwXAQc6ph',
    client_secret: 'CPsgMbeSGkQEtyXKthG8sjHYjRpk5Th49sujYqq6smVnEDMcTkn5bK3VVUJ4E6EkS4zNS888w9XvTFFWNHAQ6mfFRU2JmrepNHWu'
}

let credentials = {
    username: 'distrito-pyme-production',
    password: 'YX7fxJ5swyKEr9c8W6gewdF2kjrGRdCtU73YeapGw4uJa3EYC5',
    grant_type: 'password',
}

const finerioCredentials = {
    getToken: async() => {
        try{
            let {data} = await axios.post("https://api-v2.finerio.mx/oauth/token",
                querystring.stringify(credentials), {
                headers: {
                    'Content-Type':'application/x-www-form-urlencoded',  
                },
                auth: {
                  username: authorization.client_id,
                  password: authorization.client_secret
                }
            });

            return data.access_token;
        }
        catch(error){
            console.log(error.response)
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener el token."
            };
            return response;
        };
    }
}

module.exports = finerioCredentials;