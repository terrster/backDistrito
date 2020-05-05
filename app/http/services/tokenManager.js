'use estrict'

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(path.resolve("config/private.key"));
const publicKey = fs.readFileSync(path.resolve("config/public.key"));
const options = require("../../../config/jwt_options");

var tokenManager = {

    encode: async(request) => {
        let encodedData = await jwt.sign(request, privateKey, options);
        
        return {
            encoded: true,
            encodedData: encodedData
        };
    },
    decode: async(token) => {
        if(token){
            let tokenResult = await jwt.verify(token, publicKey, options, (error, decoded) => {      
                if(error){
                    return {
                        msg: 'Token inválido' 
                    }    
                }
        
                return {
                    data: decoded
                }   
            });

            return tokenResult;
        } 
        else{
            return { 
                msg: 'Token no proveído' 
            }
        }
    }
}

module.exports = tokenManager;
