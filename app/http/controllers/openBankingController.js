'use strict'

const User = require("../models/User");
const finerioController = require("../controllers/finerioController");
const Finerio = require("../models/Finerio");

const openBankingController = {
    store: async(request, response) =>{
        let idUser = request.headers.tokenDecoded.data.id;
        let banks = request.body;

        try{
            let user = await User.findById(idUser);

            if(user.idClient.appliance[0].idFinerio){
                let credentials = user.idClient.appliance[0].idFinerio.credentials;

                Object.keys(banks).map(async(key) => {
                    if(!banks[key].validate){
                        let params = {
                            customerId : user.idClient.appliance[0].idFinerio.idFinerio,
                            bankId : banks[key].id,
                            username : banks[key].values.username,
                            password : banks[key].values.password
                        };
                        
                        let finerioCredentialAPI = await finerioController.storeCredential(params);

                        credentials.push({
                            id: finerioCredentialAPI.id,
                            idBank : params.bankId,
                            username : params.username
                        });

                        await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});

                        request.app.get("io").emit('askForToken', {
                            idCredential: finerioCredentialAPI.id
                        });

                        return response.json({
                            code: 200,
                            msg: 'Correcto',
                            credential: {
                                id: finerioCredentialAPI.id,
                                idBank : params.bankId,
                                username : params.username
                            }
                        });
                    }
                });
            }
            else{
                // let finerioAPI = await finerioController.storeCustomer(user.email);
            }
        } 
        catch(error){
            console.log(error);
            return response.json({
                code: 500,
                msg: 'Ha ocurrido un error al tratar de guardar tus datos bancarios'
            });
        }

        /*Store function what was in comercialInfoController*/
        // if(banks.length > 0){

        //     let finerioAPI = await finerioController.storeCustomer(user.email);
        //     let credentials = [];

        //     for await(let bank of banks){
        //         let params = {
        //             customerId : finerioAPI.data.id,
        //             bankId : bank.id,
        //             username : bank.username,
        //             password : bank.password,
        //             securityCode : bank.securityCode ? bank.securityCode : null
        //         }

        //         let finerioCredentialAPI = await finerioController.storeCredential(params);

        //         credentials.push({
        //             id: finerioCredentialAPI.data.id,
        //             idBank : params.bankId,
        //             username : params.username
        //         });
        //     }

        //     let params = {
        //         idFinerio : finerioAPI.data.id,
        //         credentials : credentials
        //     }

        //     let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', { 
        //         value: finerioAPI.data.id,
        //         name: 'id_finerio'
        //     });

        //     if(dealUpdated.error){
        //         return response.json({
        //             code: 500,
        //             msg : "Algo salió mal tratando de guardar información | Hubspot: id_finerio",
        //             error: dealUpdated.error
        //         });
        //     }

        //     let finerio = await Finerio.create(params);
        //     await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
        //         idFinerio : {
        //             _id : finerio._id
        //         }
        //     });
        // }

        /*Update function what was in comercialInfoController*/
        // if(banks.length >= 0){

        //     if(!user.idClient.appliance[0].idFinerio){//Si no tiene idFinerio
        //         let finerioAPI = await finerioController.storeCustomer(user.email);

        //         let dealUpdated = await hubspotController.deal.update(user.hubspotDealId, 'single_field', { 
        //             value: finerioAPI.data.id,
        //             name: 'id_finerio'
        //         });

        //         if(dealUpdated.error){
        //             return response.json({
        //                 code: 500,
        //                 msg : "Algo salió mal tratando de guardar información | Hubspot: id_finerio",
        //                 error: dealUpdated.error
        //             });
        //         }

        //         let credentials = [];

        //         for await(let bank of banks){
        //             let params = {
        //                 customerId : finerioAPI.data.id,
        //                 bankId : bank.id,
        //                 username : bank.username,
        //                 password : bank.password,
        //                 securityCode : bank.securityCode ? bank.securityCode : null
        //             }

        //             let finerioCredentialAPI = await finerioController.storeCredential(params);

        //             credentials.push({
        //                 id: finerioCredentialAPI.data.id,
        //                 idBank : params.bankId,
        //                 username : params.username
        //             });
        //         }

        //         let params = {
        //             idFinerio : finerioAPI.data.id,
        //             credentials : credentials
        //         }

        //         let finerio = await Finerio.create(params);
        //         await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
        //             idFinerio : {
        //                 _id : finerio._id
        //             }
        //         });
        //     }
        //     else{//Si tiene, crear o actualizar credenciales
        //         let credentials = [];

        //         for await(let bank of banks){
                    
        //             if(bank.idCredential){ //console.log("Update")
        //                 let params = {
        //                     customerId : user.idClient.appliance[0].idFinerio.idFinerio,
        //                     idCredential : bank.idCredential,
        //                     bankId : bank.id,
        //                     username : bank.username,
        //                     password : bank.password,
        //                     securityCode : bank.securityCode ? bank.securityCode : null
        //                 }
    
        //                 await finerioController.updateCredential(params);
                        
        //                 credentials.push({
        //                     id: params.idCredential,
        //                     idBank : params.bankId,
        //                     username : params.username
        //                 });
        //             }
        //             else{
        //                 let params = {
        //                     customerId : user.idClient.appliance[0].idFinerio.idFinerio,
        //                     bankId : bank.id,
        //                     username : bank.username,
        //                     password : bank.password,
        //                     securityCode : bank.securityCode ? bank.securityCode : null
        //                 }
    
        //                 let finerioCredentialAPI = await finerioController.storeCredential(params);
    
        //                 credentials.push({
        //                     id: finerioCredentialAPI.data.id,
        //                     idBank : params.bankId,
        //                     username : params.username
        //                 });
        //             }
        //         }

        //         await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});
        //     }
        // }

    },
    // update: async() => {

    // },
    delete: async() => {

    },
    storeToken: async(request, response) => {
        let params = request.body;
        let result = await finerioController.provideToken(params);

        return response.json({result});
    }
}

module.exports = openBankingController;