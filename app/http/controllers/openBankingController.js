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
    store: async(request, response) =>{
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
                }
            }

            let credentials = user.idClient.appliance[0].idFinerio.credentials;

            banks = Object.keys(banks).filter(b=> banks[b].validate === false);

            console.log(banks);
            Object.keys(banks).map(async(key) => {
                // if(!banks[key].validate){
                    let params = {
                        customerId: user.idClient.appliance[0].idFinerio.idFinerio,
                        bankId: banks[key].id,
                        username: banks[key].values.username,
                        password: banks[key].values.password,
                        securityCode: banks[key].values.securityCode
                    };
                    
                    let credential = credentials.find(credential => credential.username == params.username);

                    if(credential){
                        await finerioController.deleteCredential({
                            idUser: idUser,
                            idCredential: credential.id,
                            controller: true
                        });

                        credentials = credentials.filter(c => c.username != params.username);
                    }
                    
                    let finerioCredentialAPI = await finerioController.storeCredential(params);
                    
                    credentials.push({
                        id: finerioCredentialAPI.id,
                        idBank : params.bankId,
                        bankName: bankInformation[params.bankId],
                        username : params.username
                    });

                    await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: credentials});

                    return response.json({
                        code: 200,
                        msg: 'Credencial guardada correctamente',
                        idCredential: finerioCredentialAPI.id
                    });
                // }
                // else{
                //     return response.json({
                //         code: 204,
                //         msg: 'No hay nuevas credenciales que guardar'
                //     });
                // }
            });

            return response.json({
                code: 204,
                msg: 'No hay nuevas credenciales que guardar'
            });
        } 
        catch(error){
            console.log(error);
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