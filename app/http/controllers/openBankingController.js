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

const openBankingController = {
    store: async(request, response) =>{console.log("Recibiendo...");
        let idUser = request.headers.tokenDecoded.data.id;
        let banks = request.body;

        let banksToIgnore = Object.keys(banks).filter(b => banks[b].validate == true);

        banksToIgnore.map((b) => {
            delete banks[b];
        });

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
                    user = await User.findById(idUser);
                }
            }

            let credentials = user.idClient.appliance[0].idFinerio.credentials;
            let bank = Object.values(banks)[0];

            // Object.keys(banks).map(async(key) => {
                // if(!banks[key].validate){

                    // let params = {
                    //     customerId: user.idClient.appliance[0].idFinerio.idFinerio,
                    //     bankId: bank.id,
                    //     username: bank.values.username,
                    //     password: bank.values.password,
                    //     securityCode: bank.values.securityCode
                    // };
                    
                    // let credentialExist = credentials.find(credential => credential.username == params.username);

                    // if(credentialExist){
                    //     await finerioController.deleteCredential({
                    //         idUser: idUser,
                    //         idCredential: credentialExist.id,
                    //         controller: true
                    //     });

                    //     credentials = credentials.filter(c => c.username != params.username);
                    // }
                    
                    // let finerioCredentialAPI = await finerioController.storeCredential(params);
                    // console.log("finerioCredentialAPI:",finerioCredentialAPI);

                    // if(finerioCredentialAPI.hasOwnProperty('status')){
                    //     if(finerioCredentialAPI.status == 500){
                    //         return response.json({
                    //             code: 500,
                    //             msg: 'Ha ocurrido un error al tratar de guardar tus datos bancarios'
                    //         });
                    //     }
                    // }
                    // else{
                    //     credentials.push({
                    //         id: finerioCredentialAPI.id,
                    //         idBank : params.bankId,
                    //         bankName: bankInformation[params.bankId],
                    //         username : params.username
                    //     });
    
                    //     await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});
    
                    //     response.json({
                    //         code: 200,
                    //         msg: 'Credencial guardada correctamente',
                    //         idCredential: finerioCredentialAPI.id
                    //     });
                    // }

                    return response.json({
                        code: 200,
                        msg: 'Credencial guardada correctamente'
                    });

            // });
        } 
        catch(error){
            console.log("Error:", error);
            return response.json({
                code: 500,
                msg: 'Ha ocurrido un error al tratar de guardar tus datos bancarios'
            });
        }
    },
    storeToken: async(request, response) => {
        let params = request.body;
        let result = await finerioController.provideToken(params);
        
        if(result.status == 202){
            return response.json({
                code: 200,
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