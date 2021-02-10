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
const publicKey = fs.readFileSync(path.resolve("config/jwt/public.key"));
const options = require("../../../config/jwt/jwt_options");

router.use((request, response, next) => {
    const token = request.headers['token'];
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
            mensaje: 'Token no proveído' 
        });
    }
 });

 module.exports = router;
