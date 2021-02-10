'use strict'

const User = require("../models/User");
const finerioController = require("../controllers/finerioController");
const Finerio = require("../models/Finerio");
const Appliance = require("../models/Appliance");

const bankInformation = {
    1: "BBVA Bancomer",
    2: "Citibanamex",
    7: "Santander",
    8: "HSBC",
    10: "Invex",
    11: "Scotiabank",
    12: "Banorte",
    14: "Banco Azteca",
    16: "Bancoppel"
};

const finerioErrors = [
    {
        "code": 203,
        "key": "account_blocked",
        "description": "Online banking account blocked",
        "text": "Tu banca en línea está bloqueada. Sigue el procedimiento de tu banco para desbloquearla e intenta nuevamente sincronizar tu cuenta."
    },
    {
        "code": 504,
        "key": "gateway_timeout",
        "description": "Gateway timeout",
        "text": "Hubo un problema de conexión con tu banco. Sincroniza tu cuenta nuevamente en 5 minutos."
    },
    {
        "code": 500,
        "key": "internal_error",
        "description": "Internal connection error",
        "text": "Hubo un problema de conexión con tu banco. Por favor, comunícate con soporte técnico"
    },
    {
        "code": 408,
        "key": "internal_unavailable_service",
        "description": "Service unavailable due to internal login process",
        "text": "Hubo un problema de conexión con tu banco. Sincroniza tu cuenta nuevamente en 5 minutos."
    },
    {
        "code": 403,
        "key": "action_required",
        "description": "Institution online platform inactive or user action required",
        "text": "Hubo un problema de conexión con tu banco. No has activado tu banca en línea o se requiere que hagas alguna configuración extra"
    },
    {
        "code": 401,
        "key": "invalid_credentials",
        "description": "Username, password or token are incorrect",
        "text": "Error de conexión. {text}"
    },
    {
        "code": 503,
        "key": "simultaneus_session",
        "description": "Simultaneous online banking session",
        "text": "Hay una sesión activa de tu banca en línea. Por favor, ciérrala, espera 15 minutos e intenta de nuevo."
    }
];

const openBankingController = {
    store: async(request, response) =>{
        let idUser = request.headers.tokenDecoded.data.id;
        let banks = request.body;

        // global.io.emit('askForToken', {
        //     idCredential: 1
        // });
        // return response.json({
        //     code: 200,
        //     msg: 'Correcto'
        // });

        try{
            let user = await User.findById(idUser);
            let idFinerio = null;

            if(user.idClient.appliance[0].idFinerio){//If exist an finerio account
                idFinerio = user.idClient.appliance[0].idFinerio.idFinerio;

                global.io.setIdFinerio(idUser, idFinerio);
            }
            else{//If not exist an finerio account, it will be created
                let finerioAPI = await finerioController.storeCustomer(user.email);

                if(finerioAPI.code == 200){
                    let finerioStored = await Finerio.create({
                        idUser: {
                            _id: idUser
                        },
                        idFinerio: finerioAPI.data.id
                    });

                    await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
                        idFinerio : {
                            _id : finerioStored._id
                        }
                    });

                    idFinerio = finerioStored.idFinerio;
                    global.io.setIdFinerio(idUser, idFinerio);
                }
            }

            let credentials = user.idClient.appliance[0].idFinerio.credentials;

            Object.keys(banks).map(async(key) => {
                if(!banks[key].validate){
                    let params = {
                        customerId: user.idClient.appliance[0].idFinerio.idFinerio,
                        bankId: banks[key].id,
                        username: banks[key].values.username,
                        password: banks[key].values.password,
                        securityCode: banks[key].values.securityCode
                    };
                    
                    let credential = credentials.find(credential => credential.username == params.username);

                    if(credential){
                        // params.idCredential = credential.id;

                        // await finerioController.updateCredential(params);

                        await finerioController.deleteCredential({
                            idUser: idUser,
                            idCredential: credential.id,
                            controller: true
                        });

                        let index = credentials.findIndex(credential => credential.username == params.username);
                        credentials.splice(index, index);
                    }
                    
                    let finerioCredentialAPI = await finerioController.storeCredential(params);
                    // finerioErrors.find(error => error.code == code);
                    
                    credentials.push({
                        id: finerioCredentialAPI.id,
                        idBank : params.bankId,
                        bankName: bankInformation[params.bankId],
                        username : params.username
                    });

                    await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});

                    user = await User.findById(idUser);

                    /*Temporal*/
                    let dataUser = global.io.getUser(user.idClient.appliance[0].idFinerio.idFinerio);
                    global.io.emitToSocket(dataUser.socketId, 'askForToken', {
                        idCredential: finerioCredentialAPI.id
                    });

                    return response.json({
                        code: 200,
                        msg: 'Credencial guardada correctamente'
                    });
                }
            });
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
        
        if(result.status == 202){
            return response.json({
                msg: 'Token guardado correctamente'
            });
        }

        response.json({
            code: 500,
            msg: 'Hubo un error al guardar el token'
        });
    }
}

module.exports = openBankingController;