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

const getNameProperty = async(key) => {
    switch(key){
        case "oficialID":
            return[
                'n9_1_id',
                'n9_1_2_id',
                'n9_1_3_id',
                'n9_1_4_id',
            ];
        case "proofAddress":
            return[
                'n9_2_comp_domicilio',
                'n9_2_1_comp_domicilio_2',
                'n9_2_2_comp_domicilio_3',
            ];
        case "bankStatements":
            return[
                'n9_3_estados_de_cuenta',
                'n9_3_1_estados_de_cuenta',
                'n9_3_2_estados_de_cuenta',
                'n9_3_3_estados_de_cuenta',
                'n9_3_4_estados_de_cuenta',
                'n9_3_5_estados_de_cuenta',
                'n9_3_6_estados_de_cuenta',
                'n9_3_7_estados_de_cuenta',
                'n9_3_8_estados_de_cuenta',
                'n9_3_9_estados_de_cuenta',
                'n9_3_10_estados_de_cuenta',
                'n9_3_11_estados_de_cuenta',
          ];
        case "rfc":
            return['n9_4_rfc'];
        case "lastDeclarations":
            return[
                'n9_5_declaraci_n',
                'n9_5_1_declaraci_n',
                'n9_5_2_declaraci_n',
                'n9_5_3_declaraci_n',
            ];
        case "acomplishOpinion":
            return['n9_6_opini_n_de_cumplimiento'];
        case "constitutiveAct":
            return['n9_9_acta_constitutiva'];
        case "financialStatements":
            return[
                'n9_93_1_eeff',
                'n9_93_1_1_eeff',
                'n9_93_2_eeff',
                'n9_93_2_1_eeff',
                'n9_93_3_eeff',
                'n9_93_3_1_eeff',
            ];
        case "others":
            return[
                'n9_8_otros',
                'n9_8_1_otros_2',
                'n9_8_2_otros_3',
                'n9_8_3_otros_4',
            ];
    }
}

const documentsController = {

    store: async(request, response) => {
        let id = request.params.id;//id de user
        
        const {files} = request;		

        if(!files){
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{console.log("store")
            var filesUploaded = {};
            const UploadFiles = Object.keys(files).map(async(key) => {
                if(files[key].length){
                    for await(let file of files[key]){
                        let fileUrl = await fileManager.UploadFilesToS3(file);	
                        if(!filesUploaded[key]){
                            filesUploaded[key] = [fileUrl];
                        }
                        else{
                            let index = Object.keys(filesUploaded[key])[Object.keys(filesUploaded[key]).length - 1];
                            filesUploaded[key][parseInt(index) + 1] = fileUrl;
                        }
                    }
                }
                else{
                    let fileUrl = await fileManager.UploadFilesToS3(files[key]);
                    filesUploaded[key] = [fileUrl];
                }
            });

            await Promise.all(UploadFiles);
            fileManager.deleteFromServer();

            let user = await User.findById(id);
            let documentStored = await Documents.create({
                idClient: {
                    _id: user.idClient[0]._id
                }
            });
            var docs = await Documents.findById(documentStored._id);

            const UpdateFiles = Object.keys(filesUploaded).map(async(key) => {console.log(key);
                var index = docs[key].length;console.log(index);
                let property = await getNameProperty(key);console.log(property);

                if(Array.isArray(filesUploaded[key])){console.log("map2-nuevo-multiple");
                    var i = index;
                    Object.keys(filesUploaded[key]).forEach(async(item) => {
                        if(property[i] != null){
                            let params = {
                                name: property[i],
                                value: filesUploaded[key][item]
                            }
                            console.log("multiple");
                            console.log(params);
                            console.log(i);
                            hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                            i++;
                            docs = await Documents.findByIdAndUpdate(documentStored._id, {$push: {[key]: filesUploaded[key][item] } }, { new: true });
                        }
                    });
                }
                else{console.log("map2-nuevo-unico");
                    if(property[index] != null){
                        let params = {
                            name: property[index],
                            value: filesUploaded[key]
                        }
                        console.log("unico");
                        console.log(params);
                        hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(documentStored._id, {$push: {[key]: filesUploaded[key] } }, { new: true });
                    }
                }
            });

            await Promise.all(UpdateFiles);

            // if(user){
            //     let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'documents', filesUploaded);

            //     if(dealUpdated.error){
            //         return response.json({
            //             code: 500,
            //             msg : "Algo salió mal tratando de guardar información | Hubspot: documents",
            //             error: dealUpdated.error
            //         });
            //     }
            // }
            // else{
            //     return response.json({
            //         code: 500,
            //         msg : "Algo salió mal tratando de guardar información | Hubspot: documents",
            //         error: dealUpdated.error
            //     });
            // }

            // let documentStored = await Documents.create({
            //     idClient: {
            //         _id: user.idClient[0]._id
            //     }
            // });

            // let documents = await Documents.findByIdAndUpdate(documentStored._id, { $push : filesUploaded }, {multi: true, new: true });

            var statusValue = false;

            if(user.idClient[0].type == 'PF'){

                if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PFAE'){

                if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'RIF'){

                if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PM'){

                if(docs.constitutiveAct.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            await Documents.findByIdAndUpdate(documentStored._id, {status: statusValue});
            
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
    update: async(request, response) => {
        let id = request.params.id;//id de documents
        let idUser = request.headers.tokenDecoded.data.id;

        const {files} = request;//console.log(files);console.log("======");
        
        if(!files){        
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{console.log("update")
            var user = await User.findById(idUser);
            var docs = await Documents.findById(id);

            var filesUploaded = {};
            var filesReplace = {};

            const UploadFiles = Object.keys(files).map(async(key) => {
                if(files[key].length){
                    if(key.length > 25){
                        if(docs.oficialID.indexOf(key) >= 0){
                            if(!filesReplace["oficialID"]){
                                filesReplace["oficialID"] = [key];
                            }
                            else{
                                let index = Object.keys(filesReplace["oficialID"])[Object.keys(filesReplace["oficialID"]).length - 1];
                                filesReplace["oficialID"][parseInt(index) + 1] = key;
                            }
                        }
                        //filesReplace.push(key);
                    }
                    else{
                        for await(let file of files[key]){
                            let fileUrl = await fileManager.UploadFilesToS3(file);	
                            if(!filesUploaded[key]){
                                filesUploaded[key] = [fileUrl];
                            }
                            else{
                                let index = Object.keys(filesUploaded[key])[Object.keys(filesUploaded[key]).length - 1];
                                filesUploaded[key][parseInt(index) + 1] = fileUrl;
                            }
                        }
                    }
                }
                else{//console.log("map1")
                    if(key.length > 25){//console.log("map1-reemplazo")
                        //filesReplace.push(key);
                        if(docs.oficialID.indexOf(key) >= 0){
                            if(!filesReplace["oficialID"]){
                                filesReplace["oficialID"] = [key];
                            }
                            else{
                                let index = Object.keys(filesReplace["oficialID"])[Object.keys(filesReplace["oficialID"]).length - 1];
                                filesReplace["oficialID"][parseInt(index) + 1] = key;
                            }
                        }
                    }
                    else{//console.log("map1-nuevo")
                        let fileUrl = await fileManager.UploadFilesToS3(files[key]);
                        filesUploaded[key] = fileUrl;
                    }
                }
            });

            await Promise.all(UploadFiles);

            fileManager.deleteFromServer();

            console.log(filesUploaded);
            console.log("============");
            console.log(filesReplace);

            // return response.json({
            //     code: 200,
            //     msg: 'Sin archivos'
            // });
            
            const ReplaceFiles = Object.keys(filesReplace).map(async(key) => {
                if(Array.isArray(filesReplace[key])){console.log("mapR-multiple")
                    for await(let url of filesReplace[key]){
                        let property = await getNameProperty(key);
                        let index = docs[key].indexOf(url);
                        console.log(url);
                        console.log(property);
                        console.log(index);
                        // if(filesUploaded[key] != null){
                        //     if(Array.isArray(filesUploaded[key])){

                        //     }
                        //     else{

                        //     }
                        // }
                        
                        let params = {
                            name: property[index],
                            value: filesUploaded.oficialID[index]
                        }
                        console.log(params)
                    }
                }
                else{console.log("mapR-unico")
                    console.log(filesReplace[key]);
                }
            });

            await Promise.all(ReplaceFiles);

            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });

            const UpdateFiles = Object.keys(filesUploaded).map(async(key) => {console.log(key);
                var index = docs[key].length;console.log(index);
                let property = await getNameProperty(key);console.log(property);

                if(Array.isArray(filesUploaded[key])){console.log("map2-nuevo-multiple");
                    var i = index;
                    Object.keys(filesUploaded[key]).forEach(async(item) => {
                        if(property[i] != null && filesUploaded[key][item] != undefined){
                            let params = {
                                name: property[i],
                                value: filesUploaded[key][item]
                            }
                            console.log("multiple");
                            console.log(params);
                            console.log(i);
                            hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                            i++;
                            docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key][item] } }, { new: true });
                        }
                    });
                }
                else{console.log("map2-nuevo-unico");
                    if(property[index] != null && filesUploaded[key] != undefined){
                        let params = {
                            name: property[index],
                            value: filesUploaded[key]
                        }
                        console.log("unico");
                        console.log(params);
                        hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key] } }, { new: true });
                    }
                }
            });

            await Promise.all(UpdateFiles);

            // return response.json({
            //     code: 200,
            //     msg: 'Sin archivos'
            // });

            var statusValue = false;

            if(user.idClient[0].type == 'PF'){

                if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PFAE'){

                if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'RIF'){

                if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PM'){

                if(docs.constitutiveAct.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                    statusValue = true;
                }

            }

            var user = await User.findById(idUser);//console.log("termino exitoso")
            await Documents.findByIdAndUpdate(id, {status: statusValue});

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
    },
    delete: async(request, response) => {
        let id = request.params.id;//id de documents
        let idUser = request.headers.tokenDecoded.data.id;
        
        let data = request.body;

        if(data.name == '' && data.url == ''){
            return response.json({
                code: 200,
                msg: 'Sin datos para eliminar'
            });
        }

        let user = await User.findById(idUser);
        let docs = await Documents.findById(id);

        let property = await getNameProperty(data.name);
        let index = docs[data.name].indexOf(data.url);

        let params = {
            name: property[index],
            value: ""
        };

        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
        await Documents.findByIdAndUpdate(id, {$pull: {[data.name]: docs[data.name][index] } });

        user = await User.findById(idUser);

        return response.json({
            code: 200,
            msg: 'Documento eliminado exitosamente',
            user: user
        });
    }
    
}

module.exports = documentsController;
