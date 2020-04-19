'use strict'

const aws = require('../services/s3/awsBucketUtils');
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

var documentsController = {

    store: async(request, response) => {
        if(!request.files){
            response.status(304).send({ status: 'ERROR', code: 304, data: 'Sin archivos' });
        } 
        else{
            try{
              const { file } = request.files;
              // Nombre del archivo en el bucket, modificar conforme se necesite
              const filePath = await aws.moveFile(file); 
              const contentType = aws.getContentType(file.name);
              const base64 = await aws.getBase64(filePath);
              const filename = `${new Date().getTime()}-${file.name}`;console.log(filename);
              const url = await aws.uploadFile(filename, base64, contentType);
              response.send({ status: 'OK', code: 200, data: url });
              console.log(url)
            } 
            catch(err){
              console.log(err);
              response.status(500).send({ error: Boolean , message: String, data: url });
            }
        }
    },
    update: async(request, response) => {

    }

}

module.exports = documentsController;