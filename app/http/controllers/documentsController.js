'use strict'

const fileManager = require('../services/fileManager');
const User = require("../models/User");
const Documents = require("../models/Documents");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const documentsController = {

    store: async(request, response) => {//aún no ha sido probado con multiple archivos de un mismo nombre
        let id = request.params.id;//id de user
        
        const {files} = request;

        if(!files){
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            let filesUploaded = await fileManager.UploadFilesToS3(files);

            let user = await User.findById(id);

            let documentStored = await Documents.create({
                idClient: {
                    _id: user.idClient[0]._id
                }
            });

            await Documents.findByIdAndUpdate(documentStored._id, { $push : filesUploaded });
            
            await Appliance.findByIdAndUpdate(user.idClient[0].appliance[0]._id, {
                idDocuments : {
                    _id : documentStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id, {
                idDocuments: {
                    _id: documentStored._id
                }
            });

            user = await User.findById(id);

            return response.json({
                code: 200,
                msg: 'Documento(s) cargado(s) exitosamente',
                user: user
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de cargar documentos",
                error: error
            });
        }
    },
    update: async(request, response) => {//pendiente
        let id = request.params.id;//id de user

        const {files} = request;

        if(!files){
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            let filesUploaded = await fileManager.UploadFilesToS3(files);

            await Documents.findByIdAndUpdate(id, { $push : filesUploaded });

            let user = await User.findById(idUser);

            return response.json({
                code: 200,
                msg: 'Documento(s) actualizado(s) exitosamente',
                user: user
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de cargar documentos",
                error: error
            });
        }
    }

}

module.exports = documentsController;
