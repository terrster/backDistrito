'use strict'

const hubspotController = require("../controllers/hubspotController");
const fileManager = require('../services/fileManager');
const User = require("../models/User");
const Documents = require("../models/Documents");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const getDocsMethod = (type) => {
    let docFiles = [];
    switch (type) {
      case "PF":
        docFiles = ["oficialID", "proofAddress", "bankStatements", "others"];
        break;
      case "PFAE":
        docFiles = [
          "oficialID",
          "rfc",
          "proofAddress",
          "bankStatements",
          "lastDeclarations",
          "acomplishOpinion",
          "others",
        ];
        break;
      case "RIF":
        docFiles = [
          "oficialID",
          "rfc",
          "proofAddress",
          "bankStatements",
          "lastDeclarations",
          "acomplishOpinion",
          "others",
        ];
        break;
      case "PM":
        docFiles = [
          "constitutiveAct",
          "rfc",
          "proofAddress",
          "financialStatements",
          "bankStatements",
          "lastDeclarations",
          "oficialID",
          "proofAddressMainFounders",
          "others",
        ];
        break;
      default:
        break;
    }
    return docFiles;
  };

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
			let status = true;
			const idDocuments = [];
			
            let filesParams = new Object();
            filesUploaded.map(async(name, key) => {
                let index = Object.keys(name)[0];
                idDocuments.push(index);
                filesParams[index] = filesUploaded[key][index];
            });

            let user = await User.findById(id);

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'documents', filesParams);

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de guardar información | Hubspot: documents",
                        error: dealUpdated.error
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg : "Algo salió mal tratando de guardar información | Hubspot: documents",
                    error: dealUpdated.error
                });
            }

            let documentStored = await Documents.create({
                idClient: {
                    _id: user.idClient[0]._id
                }
            });

            await Documents.findByIdAndUpdate(documentStored._id, { $push : filesParams });
            
			// Verificar si ya se han subido todos los documentos
			if (user.idClient[0].type !== null){
				const keyDocs = getDocsMethod(user.idClient[0].type);
				
				for (let x = 0; x < keyDocs.length; x++){
					const key = keyDocs[x];
					if (!idDocuments.includes(key)){
						status = false;
						break;
					}
				}
			}
            await Documents.findByIdAndUpdate(documentStored._id , { status });
            
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
    update: async(request, response) => {//pendiente no distigue posición de array para editar
        let id = request.params.id;//id de documents
        let idUser = request.headers.tokenDecoded.data.id;

        const {files} = request;

        if(!files){
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            let filesUploaded = await fileManager.UploadFilesToS3(files);			

            let filesParams = new Object();
            filesUploaded.map(async(name, key) => {
                let index = Object.keys(name)[0];
                filesParams[index] = filesUploaded[key][index];
            });

            let user = await User.findById(idUser);

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'documents', filesParams);

                if(dealUpdated.error){
                    return response.json({
                        code: 500,
                        msg : "Algo salió mal tratando de actualizar información | Hubspot: documents",
                        error: dealUpdated.error
                    });
                }
            }
            else{
                return response.json({
                    code: 500,
                    msg: "Algo salió mal tratando de actualizar información | Hubspot: documents"
                });
            }

            await Documents.findByIdAndUpdate(id, { $push : filesParams });
            
            user = await User.findById(idUser);
			let status = true;
			// Verificar si ya se han subido todos los documentos
			if (user.idClient[0].type !== null){
				const keyDocs = getDocsMethod(user.idClient[0].type);
				
				const idClient = user.idClient[0];
				const appliance = idClient.appliance[0];
				const idDocuments = appliance.idDocuments[0]
				
				for (let x = 0; x < keyDocs.length; x++){
					const key = keyDocs[x];
					if (idDocuments[key].length === 0){
						status = false;
						break;
					}
				}
			}
            await Documents.findByIdAndUpdate(id, { status });
            
            await Appliance.findByIdAndUpdate(user.idClient[0].appliance[0]._id, {
                idDocuments : {
                    _id : id
                }
            });

            await Client.findByIdAndUpdate(user.idClient[0]._id, {
                idDocuments: {
                    _id: id
                }
            });


            user = await User.findById(idUser);

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
