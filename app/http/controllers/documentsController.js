'use strict'

const aws = require('../services/s3/awsBucketUtils');
const { MongoUserService } = require("../services/MongoUserService");
const { MongoDocumentService } = require("../services/MongoDocumentService");
const { MongoClientService } = require("../services/MongoClientService");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

var documentsController = {

    store: async(request, response) => {
		let id = request.headers.tokenDecoded.data.id;
		console.log(request.body);
        var User = await MongoUserService.getFullUser(id);
        console.log(User);
        var idDocument = "";

        if(User.idClient[0].idDocuments == ""){
			console.log("No hay documentos antiguos");
            var newDocument = await MongoDocumentService.store(User.idClient[0]);
            var updatedClient = await MongoClientService.updateClient_Documents(User.idClient[0]._id, newDocument._id);
            idDocument = newDocument._id;
            response.json({ status: 'OK', code: 200, user: updatedClient });
        }
        else{
            idDocument = User.idClient[0].idDocuments[0];
        }
        
        if(!request.files){
            response.status(304).send({ status: 'ERROR', code: 304, data: 'Sin archivos' });
        } 
        else{
            try{
              const {file}  = request.files;
              // Nombre del archivo en el bucket, modificar conforme se necesite
              const filePath = await aws.moveFile(file);
              const contentType = aws.getContentType(file.name);
              const base64 = await aws.getBase64(filePath);
              const filename = `${new Date().getTime()}-${file.name}`;
              const url = await aws.uploadFile(filename, base64, contentType);

              var updateDocument = await MongoDocumentService.update(idDocument, request.body.nameFile, url);
              response.send({ status: 'OK', code: 200, data: url });
              
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
