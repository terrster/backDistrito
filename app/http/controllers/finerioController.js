'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-v2.finerio.mx/'
});
const finerioCredentials = require("../../../config/finerio/finerio_credentials");
const fs = require("fs");
const path = require("path");
const finerio_publicKey = fs.readFileSync(path.resolve("config/finerio/finerio_public.key"));
const crypto = require('crypto');
const moment = require("moment");

const User = require("../models/User");
const Finerio = require("../models/Finerio");
const FinerioCallback = require("../models/FinerioCallback");

function Encrypt(payload){
    let buffer = Buffer.from(payload, 'utf8');
    let encrypted = crypto.publicEncrypt({key:finerio_publicKey, padding : crypto.constants.RSA_PKCS1_PADDING}, buffer)
    
    return encrypted.toString("base64");
}   

function readTransactions(transactions){//Formatting transactions
    return new Promise(async(resolve, reject) => {

        if(Object.keys(transactions).length !== 0){
            let map = {};

            function getCharge(type){
                return type ? 'cargo' : 'deposito';
            }

            for await(const transaction of transactions){
                var date = moment(transaction.date).format('DD/MM/YYYY'); 
                var year = moment(transaction.date).format("YYYY");
                var month = moment(transaction.date).format("M");
                var typeCharge = getCharge(transaction.isCharge);

                transaction.date = date;

                if(Object.keys(map).length === 0){
                    map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                    map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                }
                else{
                    if(map[year]){//Year exist
                        if(map[year].data[month]){//Month exist in year
                            if(Object.keys(map[year].data[month][typeCharge]).length === 0){
                                map[year].data[month][typeCharge][0] = transaction;  
                            }
                            else{
                                let index = Object.keys(map[year].data[month][typeCharge])[Object.keys(map[year].data[month][typeCharge]).length - 1];
                                map[year].data[month][typeCharge][parseInt(index) + 1] = transaction;
                            }
                        }
                        else{//Add month to year
                            map[year].data[month] = { [typeCharge] : [transaction]};
                            map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                        }
                    }
                    else{//Add year and month
                        map[year] = { 'data' : {[month] : {[typeCharge]: [transaction]} } };
                        map[year].data[month] = {...map[year].data[month], [getCharge(!transaction.isCharge)]: []};
                    }
                }
            }

            let currentYear = new Date().getFullYear(); 

            function getLastTransaction(year){
                let ilt_month = Object.keys(map[year].data)[Object.keys(map[year].data).length - 1];
                let ilt_dep = Object.keys(map[year].data[ilt_month].deposito)[Object.keys(map[year].data[ilt_month].deposito).length - 1];
                let ilt_car = Object.keys(map[year].data[ilt_month].cargo)[Object.keys(map[year].data[ilt_month].cargo).length - 1];
     
                let index = '';//Deposito
                let index2 = '';//Cargo

                if(Object.keys(map[year].data[ilt_month].deposito).length > 0){
                    index = transactions.findIndex(transactions => transactions.id === map[year].data[ilt_month].deposito[ilt_dep].id);
                }

                if(Object.keys(map[year].data[ilt_month].cargo).length > 0){
                    index2 = transactions.findIndex(transactions => transactions.id === map[year].data[ilt_month].cargo[ilt_car].id);
                }

                if(index != '' && index2 != ''){
                    return map[year].data[ilt_month].deposito[ilt_dep].id > map[year].data[ilt_month].cargo[ilt_car].id ? map[year].data[ilt_month].deposito[ilt_dep] : map[year].data[ilt_month].cargo[ilt_car];
                }
                else if(index != ''){
                    return map[year].data[ilt_month].deposito[ilt_dep];
                }
                else if(index2 != ''){
                    return map[year].data[ilt_month].cargo[ilt_car];
                }
                else{
                    return [];
                }
            }

            if(transactions){

                map[currentYear]['last_transaction'] = getLastTransaction(currentYear);

                if(map[currentYear - 1]){
                    map[currentYear - 1]['last_transaction'] = getLastTransaction(currentYear - 1);

                    if(map[currentYear - 2]){
                        map[currentYear - 2]['last_transaction'] = getLastTransaction(currentYear - 2);
                    }
                }

            }
            else{
                map[currentYear]['last_transaction'] = [];
            }

            resolve(map);
        }
        else{
            resolve({});
        }
    });
    
}

const finerioController = {
    //Banks
    getBanks: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get('banks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let banks = [];
            data.forEach(bank => {
                if(bank.name !== 'American Express' && bank.name !== 'Liverpool' && bank.name !== 'Banregio'){
                    banks.push(bank);
                }
            });

            return response.json(banks);
        }
        catch(error){
            console.log(error);
            // let err = {
            //     msg: "Finerio: Algo salió mal tratando de obtener los bancos.",
            //     error: error.response.data.errors
            // };

            // return response.json(err);
        };
    },
    getBank: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`banks/${request.params.id}/fields`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener los datos de un banco.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'financialInstitution.not.found'){
                err = {
                    msg: "Finerio: La institución bancaria no ha sido encontrada."
                }
            }

            return response.json(err);
        }
    },
    //Customers
    storeCustomer: async(email) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.post('customers', {
                name: email
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // return response.json({
            //     msg: "Finerio: Cliente creado correctamente.",
            //     data
            // });
            return {
                code: 200,
                msg: "Finerio: Cliente creado correctamente.",
                data
            };
        }
        catch(error){
            var err = {
                code: 500,
                msg: "Algo salió mal tratando de registrar una credencial.",
                error: error.response.data
            };

            if(error.response.status == 400 && error.response.data.errors[0].code === 'customer.name.null'){
                err = {
                    msg: "Finerio: No se ha proveído un identificador name."
                };
            }
            
            if(error.response.status == 400 && error.response.data.errors[0].code === 'customer.create.name.exists'){
                err = {
                    code: 400,
                    msg: "Finerio: El identificador name ya ha sido registrado."
                };
            }
            console.log(err);
            //return response.json(err);
            return err;
        }
    },
    getCustomers: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let route = request.params.cursor ? 'customers?cursor='+request.params.cursor : 'customers';
            let {data} = await axios.get(route, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            let err = {
                msg: "Finerio: Algo salió mal tratando de obtener los clientes.",
                error: error.response.data
            };

            return response.json(err);
        }
    },
    getCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la información de un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    updateCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.put(`customers/${request.params.id}`, {
                'name': request.body.name
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json({
                msg: "Finerio: Cliente actualizado correctamente.",
                data
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            if(error.response.status == 400 && error.response.data.errors[0].code == 'customer.create.name.exists'){
               err = {
                    msg: "Finerio: El identificador name ya ha sido registrado."
               };
            }

            return response.json(err);
        }
    },
    deleteCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            await axios.delete(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json({
                msg: "Finerio: Cliente eliminado correctamente."
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de eliminar un cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    //Credentials
    storeCredential: async(request) => {
        try{
            let { customerId, bankId, username, password, securityCode, automaticFetching } = request;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    code: 500,
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                return res;
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;
            let automaticFetchingOption = automaticFetching ? automaticFetching : false;

            let params = null;

            if(securityCode){
                params = {
                    'customerId': customerId,
                    'bankId': bankId,
                    'username': usernameEncrypted,
                    'password': passwordEncrypted,
                    'securityCode': securityCodeEncrypted,
                    'automaticFetching' : automaticFetchingOption
                };
            }
            else{
                params = {
                    'customerId': customerId,
                    'bankId': bankId,
                    'username': usernameEncrypted,
                    'password': passwordEncrypted,
                    'automaticFetching' : automaticFetchingOption
                };
            }

            let token = await finerioCredentials.getToken();
            let result = await axios.post('credentials', params, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return result.data;
            
            if(result.status == 201 && result.data.status == 'VALIDATE'){
                let res = {
                    msg: "Finerio: La credencial ha sido guardada correctamente, pendiente a validación.",
                    data: result.data
                };

                //return response.json(res);
                return res;
            }
        }
        catch(error){//console.log(error.response.data.errors)
            // var err = {
            //     msg: "Finerio: Algo salió mal tratando de registrar una credencial.",
            //     error: error.response.data
            // };

            // if(error.response.status == 400 && error.response.data.errors[0].code == 'credential.create.exists'){
            //     err = {
            //         msg: "Finerio: La credencial ya existe."
            //     };
            // }

            return response.json(error.response);
            //return err;
        }
    },
    getCredentials: async(request, response) => {//ID CUSTOMER
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`credentials?customerId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener las credenciales del cliente.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'customer.not.found'){
                err = {
                    msg: "Finerio: El cliente no ha sido encontrado."
                };
            }

            return response.json(err);
        }
    },
    getCredential: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salío mal tratando de obtener la credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return response.json(err);
        }
    },
    updateCredential: async(request) => {
        try{
            let { customerId, idCredential, bankId, username, password, securityCode, automaticFetching } = request;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                return res;
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;
            let automaticFetchingOption = automaticFetching ? automaticFetching : false;

            let params = null;

            if(securityCode){
                params = {
                    'customerId': customerId,
                    'bankId': bankId,
                    'username': usernameEncrypted,
                    'password': passwordEncrypted,
                    'securityCode': securityCodeEncrypted,
                    'automaticFetching' : automaticFetchingOption
                };
            }
            else{
                params = {
                    'customerId': customerId,
                    'bankId': bankId,
                    'username': usernameEncrypted,
                    'password': passwordEncrypted,
                    'automaticFetching' : automaticFetchingOption
                };
            }

            let token = await finerioCredentials.getToken();
            let result = await axios.put(`credentials/${idCredential}`, params, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(result.status == 204){
                let res = {
                    msg: "Finerio: La credencial ha sido actualizada correctamente, pendiente a validación."
                };

                return res;
            }
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de una credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada.",
                };
            }

            //return response.json(err);
            return err;
        }
    },
    deleteCredential: async(request, response) => {
        try{
            let idUser = request.idUser || request.headers.tokenDecoded.data.id;
            let idCredential = request.idCredential || request.params.id;
            let controller = request.controller || false;

            console.log({
                idUser,
                idCredential,
                controller
            });

            let token = await finerioCredentials.getToken();
            let result = await axios.delete(`credentials/${idCredential}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let user = await User.findById(idUser);
            let credentials = user.idClient.appliance[0].idFinerio.credentials;
            let index = credentials.findIndex(c => c.id === idCredential);
            const newCredentials = credentials.splice(index, 1);
            await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {credentials: newCredentials});
            user = await User.findById(idUser);

            if(result.status == 204){
                if(controller){
                    return {
                        code: 204,
                        msg: "Finerio: Credencial eliminada correctamente.",
                        user: user 
                    }
                }
                else{
                    return response.json({
                        msg: "Finerio: Credencial eliminada correctamente.",
                        user: user 
                    });
                }
            }
        }
        catch(error){console.log(error);
            var err = {
                msg: "Finerio: Algo salió mal tratando de eliminar una credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada.",
                }
            }

            return response.json({
                code:500,
                msg: "Finerio: Algo salió mal tratando de eliminar una credencial."
            });
        }
    },
    provideToken: async(request) => {
        let { idCredential, token } = request;

        let tokenF = await finerioCredentials.getToken();
        let result = await axios.put(`credentials/${idCredential}/interactive`, {
            'token': token,
        }, {    
            headers: {
                'Authorization': `Bearer ${tokenF}`,
                'Content-Type': 'application/json'
            }
        });

        // request.app.get("io").emit('askForTokenResult', result);

        // setTimeout(() => {
        //     request.app.get("io").emit('askForTokenResult', result);
        // }, 5000);

        return result;
    },
    getCredentialsErrors: async(request, response) => {
        let tokenF = await finerioCredentials.getToken();
        let {data} = await axios.get(`credentials/messages/failure`, {    
            headers: {
                'Authorization': `Bearer ${tokenF}`,
                'Content-Type': 'application/json'
            }
        });

        return response.json(data);
    },
    //Accounts
    getAccounts: async(request, response) => {//ID Credential
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts?credentialId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener las cuentas.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return response.json(err);
        }
    },
    getAccount: async(request, response) => {//ID Account
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts/${request.params.id}/details`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error.response.data
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada."
                };
            }

            return response.json(err);
        }
    },
    //Transactions
    getTransactions: async(request, response) => {//ID Account
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get(`transactions?accountId=${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(data.data == ''){
                return response.json({
                    msg: "Finerio: No hay transacciones que mostrar.",
                    result: data
                });
            }

            let transactions = await readTransactions(data.data);

            return response.json({
                "transactions": transactions
            });
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error.response.data
            };

            return response.json(err);
        }
    },
    getAllTransactions: async(request, response) => {//ID User
        let idDistrito = request.params.id;

        if(!idDistrito){
            return response.json("Id Distrito no proveído");
        }

        try{
            let user = await User.findOne({"idDistrito": idDistrito});
            let token = await finerioCredentials.getToken();

            let credentials = user.idClient.appliance[0].idFinerio.credentials;
            let accounts = [];
            for await(let credential of credentials){//Se leen todas las credenciales del usuario

                let accountsRsp = await axios.get(`accounts?credentialId=${credential.id}`, {    
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                let banks =  await axios.get('banks', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                for await(let account of accountsRsp.data.data){//De cada credencial se obtienen las cuentas
                    if(account.type == 'Cheques'){//Se filtran las cuentas, sólo interesan las de 'Cheques'
                        account.credentialId = credential.id;
                        account.idBank = credential.idBank;

                        let bank = banks.data.find(bank => bank.id == credential.idBank);

                        account.bankName = bank.name;
                        account.username = credential.username;
                        accounts.push(account);
                    }
                }
            }

            let transactions = {};

            for await(let account of accounts){//Se leen todas las cuentas de cada credencial del usuario
                try{
                    let {data} = await axios.get(`transactions?accountId=${account.id}`, {//Se obtienen todas las transacciones de cada cuenta    
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    let transactionsMapping = await readTransactions(data.data);

                    if(Object.keys(transactions).length === 0){//Se guarda la credencial en la posición cero junto con la primer cuenta y sus transacciones
                        transactions = [
                            {
                                idCredential: account.credentialId,
                                idBank: account.idBank,
                                bankName: account.bankName,
                                username: account.username,
                                accounts: [
                                    {
                                        idAccount: account.id,
                                        name: account.name,
                                        transactions: transactionsMapping
                                    }
                                ]
                            }
                        ]
                    }
                    else{//Se verifica si ya existe la credencial
                        let indexCredential = transactions.findIndex(transactions => transactions.idCredential == account.credentialId);

                        if(indexCredential != '-1'){//Si existe sólo se añade la cuenta a la propiedad accounts
                            let indexAccount = parseInt(Object.keys(transactions[indexCredential].accounts).length);
                
                            transactions[indexCredential].accounts[indexAccount] = {    
                                idAccount: account.id,
                                name: account.name,
                                transactions: transactionsMapping
                            }
                        }
                        else{//Si no existe, se crea una nueva crecencial junto con la primer cuenta y sus transacciones
                            let indexCredential = parseInt(Object.keys(transactions).length);

                            transactions[indexCredential] = {
                                idCredential: account.credentialId,
                                idBank: account.idBank,
                                bankName: account.bankName,
                                username: account.username,
                                accounts: [
                                    {
                                        idAccount: account.id,
                                        name: account.name,
                                        transactions: transactionsMapping
                                    }     
                                ]                           
                            }
                        }
                    }
                }
                catch(error){//Si se ocasiona un error se guardará la credencial ya sea en el grupo donde pertenece o cómo nueva pero sin transacciones
                    console.log(error);

                    let indexCredential = '-1';

                    // if(!Object.keys(transactions).length === 0){
                    //     indexCredential = transactions.findIndex(transactions => transactions.idCredential == account.credentialId);
                    // }
                    
                    if(indexCredential != '-1'){//Si existe sólo se añade la cuenta a la propiedad accounts transacciones vacias
                        let indexAccount = parseInt(Object.keys(transactions[indexCredential].accounts).length);
            
                        transactions[indexCredential].accounts[indexAccount] = {    
                            idAccount: account.id,
                            name: account.name,
                            transactions: []
                        }
                    }
                    else{//Si no existe, se crea una nueva crecencial junto con la primer cuenta y sin transacciones
                        let indexCredential = parseInt(Object.keys(transactions).length);

                        transactions[indexCredential] = {
                            idCredential: account.credentialId,
                            idBank: account.idBank,
                            bankName: account.bankName,
                            username: account.username,
                            accounts: [
                                {
                                    idAccount: account.id,
                                    name: account.name,
                                    transactions: []
                                }     
                            ]                           
                        }
                    }
                }    
            }

            await Finerio.findByIdAndUpdate(user.idClient.appliance[0].idFinerio._id, {transactions : transactions});

            return response.json({
                data: transactions
            });
        }
        catch(error){
            console.log(error);
        }
    },
    getAccountDetails: async(request, response) => {
        let token = await finerioCredentials.getToken();

        let accountRsp = await axios.get(`accounts/${request.body.id}/details`, {    
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(accountRsp);
    },
    //Callback
    notify: async(request, response) => {
        let data = request.body;

        if(parseInt(Object.keys(data).length)){
            if(data.stage == 'interactive'){
                await FinerioCallback.create({data: data});
                
                let user = global.io.getUser(data.customerId);

                if(user){
                    global.io.emitToSocket(user.socketId, 'askForToken', data);
                }

                return response.json({
                    status: 200,
                    msg: "Callback notify con stage interactive, recibido exitosamente"
                });
            }

            response.json({
                status: 200,
                msg: "Callback notify, recibido exitosamente"
            });
        }
        else{
            return response.json({
                status: 500,
                msg: "No se recibió nada en el callback notify"
            });
        }
    },
    success: async(request, response) => {
        let data = request.body;

        if(parseInt(Object.keys(data).length)){

            await FinerioCallback.create({data: data});
                
            let userFound = global.io.getUser(data.customerId);

            let user = await User.findById(userFound.idU);
            data.user = user;
            
            if(userFound){
                global.io.emitToSocket(userFound.socketId, 'notifySuccess', data);
            }

            response.json({
                status: 200,
                msg: "Callback success, recibido exitosamente"
            });
        }
        else{
            return response.json({
                status: 500,
                msg: "No se recibió nada en el callback success"
            });
        }
    },
    failure: async(request, response) => {
        let data = request.body;

        if(parseInt(Object.keys(data).length)){

            await FinerioCallback.create({data: data});

            let user = global.io.getUser(data.customerId);

            if(user){
                global.io.emitToSocket(user.socketId, 'notifyFailure', data);
            }

            response.json({
                status: 200,
                msg: "Callback failure, recibido exitosamente"
            });
        }
        else{
            return response.json({
                status: 500,
                msg: "No se recibió nada en el callback failure"
            });
        }
    }
};

module.exports = finerioController;