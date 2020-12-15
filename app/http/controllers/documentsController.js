'use strict'

const hubspotController = require("../controllers/hubspotController");
const fileManager = require('../services/fileManager');
const User = require("../models/User");
const Documents = require("../models/Documents");
const Appliance = require("../models/Appliance");

const getNameProperty = (key) => {
    switch(key){
        case "oficialID":
            return [
                'n9_1_id',
                'n9_1_2_id',
                'n9_1_3_id',
                'n9_1_4_id',
            ];
        case "proofAddress":
        case "proofAddressMainFounders":
            return [
                'n9_2_comp_domicilio',
                'n9_2_1_comp_domicilio_2',
                'n9_2_2_comp_domicilio_3',
            ];
        case "bankStatements":
            return [
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
            return [
                'n9_4_rfc'
            ];
        case "lastDeclarations":
            return [
                'n9_5_declaraci_n',
                'n9_5_1_declaraci_n',
                'n9_5_2_declaraci_n',
                'n9_5_3_declaraci_n',
            ];
        case "acomplishOpinion":
            return [
                'n9_6_opini_n_de_cumplimiento'
            ];
        case "constitutiveAct":
            return [
                'n9_9_acta_constitutiva'
            ];
        case "financialStatements":
            return [
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
            return [
                'n9_94_reporte_de_cobranza_tpv'
            ];
        case "localContractLease":
            return [
                'n9_95_contrato_de_arrendamiento_tpv'
            ];
    }
};

const updateHubspotMongoFiles = async(id, hubspotDealId, filesUploaded) => {
    let docs = await Documents.findById(id);
    let {properties} = await hubspotController.deal.show(hubspotDealId);

    const updateFiles = Object.keys(filesUploaded).map(async(key) => {
        let hs_property_names = getNameProperty(key);

        Object.keys(filesUploaded[key]).map(async(file) => {
            let emptyPropertyFound = {
                name: '',
                position: ''
            };
            
            for(let i = 0; i <= (docs[key].length - 1); i++){
                if(properties[hs_property_names[i]].value == ''){
                    emptyPropertyFound.name = hs_property_names[i];
                    emptyPropertyFound.position = i;
                    break;
                }
            }

            if(emptyPropertyFound.name != '' && emptyPropertyFound.position != ''){
                let params = {
                    name: emptyPropertyFound.name,
                    value: filesUploaded[key][file]
                };

                hubspotController.deal.update(hubspotDealId, 'documents-update', params);

                if(properties.hasOwnProperty(params.name)){
                    properties[params.name].value = params.value;
                }
                else{
                    properties = {
                        [params.name] : {
                            "value" : params.value
                        }
                    }
                }

                docs[key].splice(emptyPropertyFound.position, 0, params.value);
                docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, {multi: true, new: true });
            
                //console.log(properties[params.name], docs[key]);
            }
            else{
                let params = {
                    name: hs_property_names[docs[key].length],
                    value: filesUploaded[key][file]
                };

                hubspotController.deal.update(hubspotDealId, 'documents-update', params);

                properties = {
                    [params.name] : {
                        "value" : params.value
                    }
                }

                docs[key].push(params.value);                     
                docs = await Documents.findByIdAndUpdate(id, {[key]: docs[key]}, {multi: true, new: true });         
                
                //console.log(properties[params.name], docs[key]);
            }
        });
    });

    await Promise.all(updateFiles);
};

const missingFiles = async(user, idDocs) => {
    return new Promise((resolve) => {
        setTimeout(async() => {
            let docs = await Documents.findById(idDocs);
            let statusValue = false;

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

            if(user.idClient.type == 'PFAE' || user.idClient.type == 'RIF'){
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

            // if(user.idClient.type == 'RIF'){
            //     if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == false){
            //         if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0){
            //             statusValue = true;
            //         }
            //     }
            //     else if(user.idClient.appliance[0].idComercialInfo.ciec != null && user.idClient.appliance[0].idComercialInfo.terminal == true){
            //         if(docs.oficialID.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.others.length > 0 && docs.collectionReportSaleTerminals.length > 0 && docs.localContractLease.length > 0){
            //             statusValue = true;
            //         }
            //     }
            //     else{
            //         if(docs.oficialID.length > 0 && docs.rfc.length > 0 && docs.proofAddress.length > 0 && docs.bankStatements.length > 0 && docs.lastDeclarations.length > 0 && docs.acomplishOpinion.length > 0 && docs.others.length > 0){
            //             statusValue = true;
            //         }
            //     }
            // }

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

            //console.log(`Resultado de missing files para ${user.idClient.type}: ` + statusValue);
            resolve(statusValue);
        }, 1500);
    });

};

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
            let user = await User.findById(id);
            let filesUploadedToServer = fileManager.uploadToServer(files);
            var filesUploadedToS3 = await fileManager.uploadToS3(filesUploadedToServer);
            await fileManager.deleteFromServer(filesUploadedToServer);         

            let documentStored = await Documents.create({
                idClient: {
                    _id: user.idClient._id
                }
            });

            await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                idDocuments : {
                    _id : documentStored._id
                }
            });

            await updateHubspotMongoFiles(documentStored._id, user.hubspotDealId, filesUploadedToS3);

            let statusValue = await missingFiles(user, documentStored._id);

            await Documents.findByIdAndUpdate(documentStored._id, {status: statusValue});

            user = await User.findById(id);

            return response.json({
                code: 200,
                msg: 'Documento(s) cargado(s) exitosamente',
                user: user
            });

        }
        catch(error){console.log(error);
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de cargar documentos",
                error: error
            });
        }
    },
    update: async(request, response) => {
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
            let user = await User.findById(idUser);
            let filesUploadedToServer = fileManager.uploadToServer(files);
            var filesUploadedToS3 = await fileManager.uploadToS3(filesUploadedToServer);
            await fileManager.deleteFromServer(filesUploadedToServer);      

            await updateHubspotMongoFiles(id, user.hubspotDealId, filesUploadedToS3);

            let statusValue = await missingFiles(user, id);

            await Documents.findByIdAndUpdate(id, {status: statusValue});

            user = await User.findById(idUser);

            return response.json({
                code: 200,
                msg: 'Documento(s) actualizado(s) exitosamente',
                user: user
            });
        }
        catch(error){console.log(error);
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

            let docsNew = await Documents.findById(id);
            let statusValue = await missingFiles(user, docsNew);

            await Documents.findByIdAndUpdate(id, {status: statusValue});

            user = await User.findById(idUser);

            return response.json({
                code: 200,
                msg: 'Documento eliminado exitosamente',
                user: user
            });
        }
    }
    
}

module.exports = documentsController;
