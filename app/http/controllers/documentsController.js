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
        case "proofAddressMainFounders":
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
        case "collectionReportSaleTerminals":
            return['n9_94_reporte_de_cobranza_tpv'];
        case "localContractLease":
            return['n9_95_contrato_de_arrendamiento_tpv'];
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
                    _id: user.idClient._id
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

            var statusValue = false;

            if(user.idClient.type == 'PF'){
                if(user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'PFAE'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'RIF'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'PM'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.constitutiveAct.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.constitutiveAct.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.constitutiveAct.length > 0 && docs.rfc.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            await Documents.findByIdAndUpdate(documentStored._id, {status: statusValue});
            
            await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                idDocuments : {
                    _id : documentStored._id
                }
            });

            await Client.findByIdAndUpdate(user.idClient._id, {
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
            console.log(error)
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de cargar documentos",
                error: error
            });
        }
    },
    update: async(request, response) => {console.log("update")
        let id = request.params.id;//id Documents
        let idUser = request.headers.tokenDecoded.data.id;

        const {files} = request;
        
        if(!files){        
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            var user = await User.findById(idUser);
            var docs = await Documents.findById(id);

            var filesUploaded = {};

            const UploadFiles = Object.keys(files).map(async(key) => {
                if(files[key].length){
                    if(key.length > 25){
                        // if(docs.oficialID.indexOf(key) >= 0){
                        //     if(!filesReplace["oficialID"]){
                        //         filesReplace["oficialID"] = [key];
                        //     }
                        //     else{
                        //         let index = Object.keys(filesReplace["oficialID"])[Object.keys(filesReplace["oficialID"]).length - 1];
                        //         filesReplace["oficialID"][parseInt(index) + 1] = key;
                        //     }
                        // }
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
                        // if(docs.oficialID.indexOf(key) >= 0){
                        //     if(!filesReplace["oficialID"]){
                        //         filesReplace["oficialID"] = [key];
                        //     }
                        //     else{
                        //         let index = Object.keys(filesReplace["oficialID"])[Object.keys(filesReplace["oficialID"]).length - 1];
                        //         filesReplace["oficialID"][parseInt(index) + 1] = key;
                        //     }
                        // }
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
            //console.log(filesReplace);

            // return response.json({
            //     code: 200,
            //     msg: 'Sin archivos'
            // });

            // console.log(filesUploaded)

            const UpdateFiles = Object.keys(filesUploaded).map(async(key) => {

                var hubspot = await hubspotController.deal.show(user.hubspotDealId);
                var index = docs[key].length;console.log(index);
                let property = await getNameProperty(key);

                var propNull = '';
                var propPos = '';
                for(let i = 0; i<index; i++){
                    if(hubspot.properties[property[i]].value == ''){
                        propNull = hubspot.properties[property[i]].versions[0].name;
                        propPos = i;
                        break;
                    }
                }

                if(Array.isArray(filesUploaded[key])){console.log("map2-nuevo-multiple");
                    var i = index;
                    var hubspot = await hubspotController.deal.show(user.hubspotDealId);
                    // console.log(hubspot.properties);
                    Object.keys(filesUploaded[key]).forEach(async(item) => {
                        //var docs = await Documents.findById(id);
                        var propNull = '';
                        var propPos = '';
                        for(let f = 0; f<property.length; f++){
                            console.log(property[f]);
                            console.log(hubspot.properties[property[f]]);
                            if(hubspot.properties[property[f]]){
                                if(hubspot.properties[property[f]].value == ''){
                                    propNull = hubspot.properties[property[f]].versions[0].name;
                                    console.log(propNull);
                                    propPos = f;
                                    console.log(propPos);
                                    break;
                                }
                            }
                            else{
                                propNull = property[f];
                                console.log(propNull);
                                propPos = f;
                                console.log(propPos);
                                break;
                            }
                        }

                        console.log("multiple");

                        if(propNull != '' && propPos >= 0){console.log("splice")
                            let params = {
                                name: propNull,
                                value: filesUploaded[key][item]
                            }
                            console.log(params);
                            hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);

                            if(hubspot.properties[params.name]){
                                hubspot.properties[params.name].value = params.value;
                            }
                            else{
                                hubspot.properties = {
                                    [params.name] : {"value" : params.value}
                                }
                            }
 
                            await docs[key].splice(propPos, 0, filesUploaded[key][item]);
                            //console.log(docs[key]);
                            docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, {multi: true, new: true });
                        }
                        // else{console.log("push");console.log(property[i]);
                        //     if(property[propPos] != null){
                        //         let params = {
                        //             name: property[propPos],
                        //             value: filesUploaded[key][item]
                        //         }
                        //         console.log(params);
                        //         console.log(i);
                        //         hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        //         hubspot.properties[params.name].value = params.value;
                        //         i++;
                        //         docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key][item] } }, { new: true });
                        //     }
                        // }
                    });
                }
                else{console.log("map2-nuevo-unico");
                    if(property[index] != null){
                        let params = {
                            name: propNull != '' ? propNull : property[index],
                            value: filesUploaded[key]
                        }
                        console.log("unico");
                        console.log(params);
                        hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
                        if(propNull != '' && propPos >= 0){console.log("splice")
                            docs[key].splice(propPos, 0, filesUploaded[key]);
                            docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, { new: true });
                        }
                        else{console.log("push")
                            docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key] } }, { new: true });
                        }
                    }
                }
            });


            // const UploadFiles = Object.keys(files).map(async(key) => {
            //     if(files[key].length){
            //         for await(let file of files[key]){
            //             let fileUrl = await fileManager.UploadFilesToS3(file);	
            //             if(!filesUploaded[key]){
            //                 filesUploaded[key] = [fileUrl];
            //             }
            //             else{
            //                 let index = Object.keys(filesUploaded[key])[Object.keys(filesUploaded[key]).length - 1];
            //                 filesUploaded[key][parseInt(index) + 1] = fileUrl;
            //             }
            //         }
            //     }
            //     else{//console.log("map1")
            //         //console.log("map1-nuevo")
            //         let fileUrl = await fileManager.UploadFilesToS3(files[key]);
            //         filesUploaded[key] = fileUrl;
            //     }
            // });

            // await Promise.all(UploadFiles);

            // fileManager.deleteFromServer();

            // console.log(filesUploaded)

            // const UpdateFiles = Object.keys(filesUploaded).map(async(key) => {

            //     var hubspot = await hubspotController.deal.show(user.hubspotDealId);
            //     var index = docs[key].length;
            //     let property = await getNameProperty(key);console.log(property)

            //     // var propNull = '';
            //     // var propPos = '';
            //     // for(let i = 0; i<index; i++){
            //     //     if(hubspot.properties[property[i]].value == ''){
            //     //         propNull = hubspot.properties[property[i]].versions[0].name;
            //     //         propPos = i;
            //     //         break;
            //     //     }
            //     // }

            //     if(Array.isArray(filesUploaded[key])){console.log("array")
            //         var i = index;
            //         var hubspot = await hubspotController.deal.show(user.hubspotDealId);
            
            //         Object.keys(filesUploaded[key]).forEach(async(item) => {
            //             var propNull = '';
            //             var propPos = '';
            //             for(let f = 0; f<property.length; f++){
            //                 console.log(hubspot.properties[property[f]])
            //                 if(hubspot.properties[property[f]].value == ''){
            //                     propNull = hubspot.properties[property[f]].versions[0].name;
            //                     propPos = f;
            //                     break;
            //                 }
            //             }

            //             if(propNull != '' && propPos >= 0){
            //                 let params = {
            //                     name: propNull,
            //                     value: filesUploaded[key][item]
            //                 }
            //                 hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
            //                 hubspot.properties[params.name].value = params.value;
            //                 await docs[key].splice(propPos, 0, filesUploaded[key][item]);
            //                 docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, {multi: true, new: true });
            //             }
            //         });
            //     }
            //     else{console.log("unico")
            //         if(property[index] != null){
            //             let params = {
            //                 name: propNull != '' ? propNull : property[index],
            //                 value: filesUploaded[key]
            //             }
   
            //             hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
            //             if(propNull != '' && propPos >= 0){
            //                 docs[key].splice(propPos, 0, filesUploaded[key]);
            //                 docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, { new: true });
            //             }
            //             else{
            //                 docs = await Documents.findByIdAndUpdate(id, {$push: {[key]: filesUploaded[key] } }, { new: true });
            //             }
            //         }
            //     }
            // });

            await Promise.all(UpdateFiles);

            var statusValue = false;

            if(user.idClient.type == 'PF'){
                if(user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'PFAE'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'RIF'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            if(user.idClient.type == 'PM'){
                if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
                    if(docs.constitutiveAct.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
                else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
                    if(docs.constitutiveAct.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
                        statusValue = true;
                    }
                }
                else{
                    if(docs.constitutiveAct.length > 0 && docs.rfc.length > 0 && docs.financialStatements.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.oficialID.length > 0 && docs.proofAddressMainFounders.length > 0 && docs.others.length > 0){
                        statusValue = true;
                    }
                }
            }

            var user = await User.findById(idUser);
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
        
        let data = request.body;console.log(data)

        if(data.name == '' && data.url == ''){
            return response.json({
                code: 200,
                msg: 'Sin datos para eliminar'
            });
        }

        let user = await User.findById(idUser);

        if(data.name != data.url){
            let hubspot = await hubspotController.deal.show(user.hubspotDealId);
            let docs = await Documents.findById(id);

            let property = await getNameProperty(data.name);
            var propName = '';

            for(let i = 0; i<property.length; i++){
                if(hubspot.properties[property[i]].value == data.url){
                    propName = hubspot.properties[property[i]].versions[0].name;
                    break;
                }
            }

            let index = docs[data.name].indexOf(data.url);

            let params = {
                name: propName,
                value: ""
            };

            await hubspotController.deal.update(user.hubspotDealId, 'documents-update', params);
            await Documents.findByIdAndUpdate(id, {$pull: {[data.name]: docs[data.name][index] } });
        }

        user = await User.findById(idUser);

        return response.json({
            code: 200,
            msg: 'Documento eliminado exitosamente',
            user: user
        });
    }
    
}

module.exports = documentsController;
