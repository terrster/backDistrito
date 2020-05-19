'use estrict'

/*
|--------------------------------------------------------------------------
| Verify Token Users
|--------------------------------------------------------------------------
*/

const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const router = express.Router(); 
const publicKey = fs.readFileSync(path.resolve("config/public.key"));
const options = require("../../../config/jwt_options");

router.use((request, response, next) => {
    const token = request.headers['token'];
    console.log(token);
    if(token){
      jwt.verify(token, publicKey, options, (error, decoded) => {      
        if(error){
            response.json({ 
                mensaje: 'Token inválido' 
            });    
        } 
        //console.log(decoded);
        //request.decoded = decoded;    
        next();
      });
    } 
    else{
        response.send({ 
            mensaje: 'Token no proveída.' 
        });
    }
 });

 module.exports = router;
