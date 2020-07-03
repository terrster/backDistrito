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

        try{
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

            let user = await User.findById(id);

            if(user){
                let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'documents', filesUploaded);

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

            let documents = await Documents.findByIdAndUpdate(documentStored._id, { $push : filesParams }, {multi: true, new: true });

            var statusValue = false;

            if(user.idClient[0].type == 'PF'){

                if(documents.oficialID.length > 0 && documents.proofAddress.length > 0 && documents.bankStatements.length > 0 && documents.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PFAE'){

                if(documents.oficialID.length > 0 && documents.rfc.length > 0 && documents.proofAddress.length > 0 && documents.bankStatements.length > 0 && documents.lastDeclarations.length > 0 && documents.acomplishOpinion.length > 0 && documents.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'RIF'){

                if(documents.oficialID.length > 0 && documents.rfc.length > 0 && documents.proofAddress.length > 0 && documents.bankStatements.length > 0 && documents.lastDeclarations.length > 0 && documents.acomplishOpinion.length > 0 && documents.others.length > 0){
                    statusValue = true;
                }

            }

            if(user.idClient[0].type == 'PM'){

                if(documents.constitutiveAct.length > 0 && documents.rfc.length > 0 && documents.proofAddress.length > 0 && documents.financialStatements.length > 0 && documents.bankStatements.length > 0 && documents.lastDeclarations.length > 0 && documents.oficialID.length > 0 && documents.proofAddressMainFounders.length > 0 && documents.others.length > 0){
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

        const {files} = request;console.log(files);console.log("======");
        
        if(!files){        
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            var user = await User.findById(idUser);
            var docs = await Documents.findById(id);
            // let {properties} = await hubspotController.deal.show(user.hubspotDealId);
            
            var filesUploaded = {};

            const SearchFileToReplace = async(key) => {
                if(docs.oficialID.indexOf(key) >= 0){
                    let property = await getNameProperty("oficialID");
                    let index = await docs.oficialID.indexOf(key);
                    if(Array.isArray(filesUploaded.oficialID)){//console.log("mapR-multiple")
                        let params = {
                            name: property[index],
                            value: filesUploaded.oficialID[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`oficialID.${index}`]: filesUploaded.oficialID[index] } }, { new: true });
                        filesUploaded.oficialID.splice(index, 1);
                    }
                    else{//console.log("mapR-unico");
                        let params = {
                            name: property[index],
                            value: filesUploaded.oficialID
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`oficialID.${index}`]: filesUploaded.oficialID } }, { new: true });
                        delete filesUploaded.oficialID;
                    }
                }

                if(docs.proofAddress.indexOf(key) >= 0){
                    let property = await getNameProperty("proofAddress");
                    let index = docs.proofAddress.indexOf(key);
                    if(Array.isArray(filesUploaded.proofAddress)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.proofAddress[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`proofAddress.${index}`]: filesUploaded.proofAddress[index] } }, { new: true });
                        filesUploaded.proofAddress.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.proofAddress
                        }
                        //console.log(params)
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`proofAddress.${index}`]: filesUploaded.proofAddress } }, { new: true });
                        delete filesUploaded.proofAddress;
                    }
                }
                if(docs.bankStatements.indexOf(key) >= 0){
                    let property = await getNameProperty("bankStatements");
                    let index = docs.bankStatements.indexOf(key);
                    if(Array.isArray(filesUploaded.bankStatements)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.bankStatements[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`bankStatements.${index}`]: filesUploaded.bankStatements[index] } }, { new: true });
                        filesUploaded.bankStatements.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.bankStatements
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`bankStatements.${index}`]: filesUploaded.bankStatements } }, { new: true });
                        delete filesUploaded.bankStatements;
                    }
                }
                if(docs.rfc.indexOf(key) >= 0){
                    let property = await getNameProperty("rfc");
                    let index = docs.rfc.indexOf(key);
                    if(Array.isArray(filesUploaded.rfc)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.rfc[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`rfc.${index}`]: filesUploaded.rfc[index] } }, { new: true });
                        filesUploaded.rfc.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.rfc
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`rfc.${index}`]: filesUploaded.rfc } }, { new: true });
                        delete filesUploaded.rfc;
                    }
                }
                if(docs.lastDeclarations.indexOf(key) >= 0){
                    let property = await getNameProperty("lastDeclarations");
                    let index = docs.lastDeclarations.indexOf(key);
                    if(Array.isArray(filesUploaded.lastDeclarations)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.lastDeclarations[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`lastDeclarations.${index}`]: filesUploaded.lastDeclarations[index] } }, { new: true });
                        filesUploaded.lastDeclarations.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.lastDeclarations
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`lastDeclarations.${index}`]: filesUploaded.lastDeclarations } }, { new: true });
                        delete filesUploaded.lastDeclarations;
                    }
                }
                if(docs.acomplishOpinion.indexOf(key) >= 0){
                    let property = await getNameProperty("acomplishOpinion");
                    let index = docs.acomplishOpinion.indexOf(key);
                    if(Array.isArray(filesUploaded.acomplishOpinion)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.acomplishOpinion[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`acomplishOpinion.${index}`]: filesUploaded.acomplishOpinion[index] } }, { new: true });
                        filesUploaded.acomplishOpinion.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.acomplishOpinion
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`acomplishOpinion.${index}`]: filesUploaded.acomplishOpinion } }, { new: true });
                        delete filesUploaded.acomplishOpinion;
                    }
                }
                if(docs.constitutiveAct.indexOf(key) >= 0){
                    let property = await getNameProperty("constitutiveAct");
                    let index = docs.constitutiveAct.indexOf(key);
                    if(Array.isArray(filesUploaded.constitutiveAct)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.constitutiveAct[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`constitutiveAct.${index}`]: filesUploaded.constitutiveAct[index] } }, { new: true });
                        filesUploaded.constitutiveAct.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.constitutiveAct
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`constitutiveAct.${index}`]: filesUploaded.constitutiveAct } }, { new: true });
                        delete filesUploaded.constitutiveAct;
                    }
                }
                if(docs.financialStatements.indexOf(key) >= 0){
                    let property = await getNameProperty("financialStatements");
                    let index = docs.financialStatements.indexOf(key);
                    if(Array.isArray(filesUploaded.financialStatements)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.financialStatements[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`financialStatements.${index}`]: filesUploaded.financialStatements[index] } }, { new: true });
                        filesUploaded.financialStatements.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.financialStatements
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`financialStatements.${index}`]: filesUploaded.financialStatements } }, { new: true });
                        delete filesUploaded.financialStatements;
                    }
                }
                if(docs.others.indexOf(key) >= 0){
                    let property = await getNameProperty("others");
                    let index = docs.others.indexOf(key);
                    if(Array.isArray(filesUploaded.others)){
                        let params = {
                            name: property[index],
                            value: filesUploaded.others[index]
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`others.${index}`]: filesUploaded.others[index] } }, { new: true });
                        filesUploaded.others.splice(index, 1);
                    }
                    else{
                        let params = {
                            name: property[index],
                            value: filesUploaded.others
                        }
                        await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        docs = await Documents.findByIdAndUpdate(id, {$set: {[`others.${index}`]: filesUploaded.others } }, { new: true });
                        delete filesUploaded.others;
                    }
                }
            }

            var filesUploaded = {};
            const UploadFiles = Object.keys(files).map(async(key) => {
                if(files[key].length){
                    if(key.length > 25){
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await SearchFileToReplace(key);
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
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await SearchFileToReplace(key);
                    }
                    else{//console.log("map1-nuevo")
                        let fileUrl = await fileManager.UploadFilesToS3(files[key]);
                        filesUploaded[key] = fileUrl;
                    }
                }
            });

            await Promise.all(UploadFiles);
            await new Promise(resolve => setTimeout(resolve, 3000));

            Object.keys(filesUploaded).map(async(key) => {
                var index = docs[key].length;
                let property = await getNameProperty(key);

                if(Array.isArray(filesUploaded[key])){//console.log("map2-nuevo-multiple")
                    var i = index;
                    Object.keys(filesUploaded[key]).forEach(async(item) => {
                        let params = {
                            name: property[i],
                            value: filesUploaded[key][item]
                        }
                        // console.log("multiple");
                        // console.log(params)
                        // console.log(i)
                        hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        i++;
                        docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key][item] } }, { new: true });
                    });
                }
                else{//console.log("map2-nuevo-unico")
                    let params = {
                        name: property[index],
                        value: filesUploaded[key]
                    }
                    // console.log("unico");
                    // console.log(params);
                    hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                    docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key] } }, { new: true });
                }
            });

            fileManager.deleteFromServer();

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
    }
    
}

module.exports = documentsController;
