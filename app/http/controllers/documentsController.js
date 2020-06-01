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
                var dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'documents', filesParams);

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

            let filesParamsDocs = {
                oficialID: [],
                proofAddress: [],
                bankStatements: [],
                constitutiveAct: [],
                otherActs: [],
                financialStatements: [],
                rfc: [],
                lastDeclarations: [],
                acomplishOpinion: [],
                facturacion: [],
                others: [],
                cventerprise: [],
                proofAddressMainFounders: []
            };

            //oficialID
            if(dealUpdated.properties.n9_1_id && dealUpdated.properties.n9_1_id.value != ''){
                filesParamsDocs.oficialID[0] = dealUpdated.properties.n9_1_id.value;
            }
            if(dealUpdated.properties.n9_1_2_id && dealUpdated.properties.n9_1_2_id.value != ''){
                filesParamsDocs.oficialID[1] = dealUpdated.properties.n9_1_2_id.value;
            }
            if(dealUpdated.properties.n9_1_3_id && dealUpdated.properties.n9_1_3_id.value != ''){
                filesParamsDocs.oficialID[2] = dealUpdated.properties.n9_1_3_id.value;
            }
            if(dealUpdated.properties.n9_1_4_id && dealUpdated.properties.n9_1_4_id.value != ''){
                filesParamsDocs.oficialID[3] = dealUpdated.properties.n9_1_4_id.value;
            }

            //proofAddress
            if(dealUpdated.properties.n9_2_comp_domicilio && dealUpdated.properties.n9_2_comp_domicilio.value != ''){
                filesParamsDocs.proofAddress[0] = dealUpdated.properties.n9_2_comp_domicilio.value;
            }
            if(dealUpdated.properties.n9_2_1_comp_domicilio_2 && dealUpdated.properties.n9_2_1_comp_domicilio_2.value != ''){
                filesParamsDocs.proofAddress[1] = dealUpdated.properties.n9_2_1_comp_domicilio_2.value;
            }
            if(dealUpdated.properties.n9_2_2_comp_domicilio_3 && dealUpdated.properties.n9_2_2_comp_domicilio_3.value != ''){
                filesParamsDocs.proofAddress[2] = dealUpdated.properties.n9_2_2_comp_domicilio_3.value;
            }

            //bankStatements
            if(dealUpdated.properties.n9_3_estados_de_cuenta && dealUpdated.properties.n9_3_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[0] = dealUpdated.properties.n9_3_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_1_estados_de_cuenta && dealUpdated.properties.n9_3_1_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[1] = dealUpdated.properties.n9_3_1_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_2_estados_de_cuenta && dealUpdated.properties.n9_3_2_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[2] = dealUpdated.properties.n9_3_2_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_3_estados_de_cuenta && dealUpdated.properties.n9_3_3_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[3] = dealUpdated.properties.n9_3_3_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_4_estados_de_cuenta && dealUpdated.properties.n9_3_4_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[4] = dealUpdated.properties.n9_3_4_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_5_estados_de_cuenta && dealUpdated.properties.n9_3_5_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[5] = dealUpdated.properties.n9_3_5_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_6_estados_de_cuenta && dealUpdated.properties.n9_3_6_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[6] = dealUpdated.properties.n9_3_6_estados_de_cuenta.value;
            }
            if(dealUpdated.n9_3_7_estados_de_cuenta && dealUpdated.properties.n9_3_7_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[7] = dealUpdated.properties.n9_3_7_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_8_estados_de_cuenta && dealUpdated.properties.n9_3_8_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[8] = dealUpdated.properties.n9_3_8_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_9_estados_de_cuenta && dealUpdated.properties.n9_3_9_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[9] = dealUpdated.properties.n9_3_9_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_10_estados_de_cuenta && dealUpdated.properties.n9_3_10_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[10] = dealUpdated.properties.n9_3_10_estados_de_cuenta.value;
            }
            if(dealUpdated.properties.n9_3_11_estados_de_cuenta && dealUpdated.properties.n9_3_11_estados_de_cuenta.value != ''){
                filesParamsDocs.bankStatements[11] = dealUpdated.properties.n9_3_11_estados_de_cuenta.value;
            }

            //constitutiveAct
            if(dealUpdated.properties.n9_9_acta_constitutiva && dealUpdated.properties.n9_9_acta_constitutiva.value != ''){
                filesParamsDocs.constitutiveAct[0] = dealUpdated.properties.n9_9_acta_constitutiva.value;
            }

            //otherActs
            if(dealUpdated.properties.n9_8_otros && dealUpdated.properties.n9_8_otros.value != ''){
                filesParamsDocs.otherActs[0] = dealUpdated.properties.n9_8_otros.value;
            }

            //financialStatements
            if(dealUpdated.properties.n9_93_1_eeff && dealUpdated.properties.n9_93_1_eeff.value != ''){
                filesParamsDocs.financialStatements[0] = dealUpdated.properties.n9_93_1_eeff.value;
            }
            if(dealUpdated.properties.n9_93_1_1_eeff && dealUpdated.properties.n9_93_1_1_eeff.value != ''){
                filesParamsDocs.financialStatements[1] = dealUpdated.properties.n9_93_1_1_eeff.value;
            }
            if(dealUpdated.properties.n9_93_2_eeff && dealUpdated.properties.n9_93_2_eeff.value != ''){
                filesParamsDocs.financialStatements[2] = dealUpdated.properties.n9_93_2_eeff.value;
            }

            //rfc
            if(dealUpdated.properties.n9_4_rfc && dealUpdated.properties.n9_4_rfc.value != ''){
                filesParamsDocs.rfc[0] = dealUpdated.properties.n9_4_rfc.value;
            }

            //lastDeclarations
            if(dealUpdated.properties.n9_5_declaraci_n && dealUpdated.properties.n9_5_declaraci_n.value != ''){
                filesParamsDocs.lastDeclarations[0] = dealUpdated.properties.n9_5_declaraci_n.value;
            }
            if(dealUpdated.properties.n9_5_1_declaraci_n && dealUpdated.properties.n9_5_1_declaraci_n.value != ''){
                filesParamsDocs.lastDeclarations[1] = dealUpdated.properties.n9_5_1_declaraci_n.value;
            }
            if(dealUpdated.properties.n9_5_2_declaraci_n && dealUpdated.properties.n9_5_2_declaraci_n.value != ''){
                filesParamsDocs.lastDeclarations[2] = dealUpdated.properties.n9_5_2_declaraci_n.value;
            }
            if(dealUpdated.properties.n9_5_3_declaraci_n && dealUpdated.properties.n9_5_3_declaraci_n.value != ''){
                filesParamsDocs.lastDeclarations[3] = dealUpdated.properties.n9_5_3_declaraci_n.value;
            }

            //acomplishOpinion
            if(dealUpdated.properties.n9_6_opini_n_de_cumplimiento && dealUpdated.properties.n9_6_opini_n_de_cumplimiento.value != ''){
                filesParamsDocs.acomplishOpinion[0] = dealUpdated.properties.n9_6_opini_n_de_cumplimiento.value;
            }

            //facturacion
            if(dealUpdated.properties.n9_7_xmls && dealUpdated.properties.n9_7_xmls.value != ''){
                filesParamsDocs.facturacion[0] = dealUpdated.properties.n9_7_xmls.value;
            }

            //others
            if(dealUpdated.properties.n9_91_reporte_de_cr_dito && dealUpdated.properties.n9_91_reporte_de_cr_dito.value != ''){
                filesParamsDocs.others[0] = dealUpdated.properties.n9_91_reporte_de_cr_dito.value;
            }
            if(dealUpdated.properties.n9_92_1_escritura && dealUpdated.properties.n9_92_1_escritura.value != ''){
                filesParamsDocs.others[1] = dealUpdated.properties.n9_92_1_escritura.value;
            }
            if(dealUpdated.properties.n9_92_2_escritura && dealUpdated.properties.n9_92_2_escritura.value != ''){
                filesParamsDocs.others[2] = dealUpdated.properties.n9_92_2_escritura.value;
            }
            if(dealUpdated.properties.n9_92_3_escritura && dealUpdated.properties.n9_92_3_escritura.value != ''){
                filesParamsDocs.others[3] = dealUpdated.properties.n9_92_3_escritura.value;
            }

            let documents = await Documents.findByIdAndUpdate(id, {$set: filesParamsDocs},{multi: true, new: true });

            user = await User.findById(idUser);

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
