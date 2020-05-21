'use strict'

const fileManager = require('../services/fileManager');
const User = require("../models/User");
const Documents = require("../models/Documents");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");

const documentsController = {

    store: async(request, response) => {
        let id = request.headers.tokenDecoded.data.id;//id de user
        
        const {files} = request;

        if(!files){
            return response.json({
                code: 200,
                msg: 'Sin archivos'
            });
        }

        try{
            let filesUploaded = await fileManager.filesUploadCore(files);

            let user = await User.findById(id);

            let { 
                oficialID,
                proofAddress,
                bankStatements,
                constitutiveAct,
                otherActs,
                financialStatements,
                rfc,
                lastDeclarations,
                acomplishOpinion,
                facturacion,
                others,
                cventerprise,
                proofAddressMainFounders,
            } = filesUploaded;

            let document = new Documents();
            document.idClient = {
                _id: user.idClient[0]._id
            };
            oficialID ? document.oficialID[0] = oficialID : undefined;
            proofAddress ? document.proofAddress[0] = proofAddress : undefined;
            bankStatements ? document.bankStatements[0] = bankStatements : undefined;
            constitutiveAct ? document.constitutiveAct[0] = constitutiveAct : undefined;
            otherActs ? document.otherActs[0] = otherActs : undefined;
            financialStatements ? document.financialStatements[0] =  financialStatements : undefined;
            rfc ? document.rfc[0] = rfc : undefined;
            lastDeclarations ? document.lastDeclarations[0] = lastDeclarations : undefined;
            acomplishOpinion ? document.acomplishOpinion[0] = acomplishOpinion : undefined;
            facturacion ? document.facturacion[0] = facturacion : undefined;
            others ? document.others[0] = others : undefined;
            cventerprise ? document.cventerprise[0] = cventerprise : undefined;
            proofAddressMainFounders ? document.proofAddressMainFounders[0] = proofAddressMainFounders : undefined;
            let documentStored = await document.save();

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

            return response.json({
                code: 200,
                msg : 'Documento(s) cargado(s) exitosamente'
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

    }

}

module.exports = documentsController;
