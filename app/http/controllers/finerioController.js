'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-v2.finerio.mx/'
});
const finerioCredentials = require("../../../config/finerio_credentials");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const finerio_publicKey = fs.readFileSync(path.resolve("config/finerio_public.key"));

const finerioController = {
    //Banks
    getBanks: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            const {data} = await axios.get('banks', {    
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
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener los bancos.",
                error: error
            };

            console.log(response);
            return response;
        };
    },
    getBank: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`banks/${request.params.id}/fields`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener los datos de un banco.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    //Customers
    storeCustomer: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.post('customers', {
                'name': request.body.name
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de registrar un cliente.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    getCustomers: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get('customers', {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener los clientes.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    getCustomer: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener la información de un cliente.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    updateCustomer: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.put(`customers/${request.params.id}`,{
                'name': request.body.name
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de un cliente.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    deleteCustomer: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.delete(`customers/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de eliminar un cliente.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    //Credentials
    storeCredential: async(request, response) => {
        try{
            let { customerId, bankId, username, password, securityCode } = request.body;

            let usernameEncrypted = jwt.sign(username, finerio_publicKey, { algorithm: "HS256" });
            let passwordEncrypted = jwt.sign(password, finerio_publicKey, { algorithm: "HS256" });
            // let securityCodeEncrypted = jwt.sign(securityCode, finerio_publicKey, { algorithm: "HS256" });
            
            const token = await finerioCredentials.getToken();
            let data = await axios.post('credentials', {
                'customerId': customerId,
                'bankId': bankId,
                'username': usernameEncrypted,
                'password': passwordEncrypted,
                // 'securityCode': securityCodeEncrypted
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(data);
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de registrar una credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    getCredentials: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get('credentials', {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener las credenciales.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    getCredential: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    updateCredential: async(request, response) => {
        try{
            let { customerId, bankId, username, password, securityCode } = request.body;

            let usernameEncrypted = jwt.sign(username, finerio_publicKey, { algorithm: "HS256" });
            let passwordEncrypted = jwt.sign(password, finerio_publicKey, { algorithm: "HS256" });
            let securityCodeEncrypted = jwt.sign(securityCode, finerio_publicKey, { algorithm: "HS256" });

            const token = await finerioCredentials.getToken();
            let {data} = await axios.put(`credentials/${request.params.id}`, {
                'customerId': customerId,
                'bankId': bankId,
                'username': usernameEncrypted,
                'password': passwordEncrypted,
                'securityCode': securityCodeEncrypted
            }, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de actualizar la información de una credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    deleteCredential: async(request, response) => {
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.delete(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de eliminar una credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    //Accounts
    getAccounts: async(request, response) => {//ID Credential
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener las cuentas.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    getAccount: async(request, response) => {//ID Account
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`accounts/${request.params.id}/details`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    },
    //Transactions
    getTransactions: async(request, response) => {//ID Account
        try{
            const token = await finerioCredentials.getToken();
            let {data} = await axios.get(`transactions/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.json(data);
        }
        catch(error){
            let response = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error
            };

            console.log(response);
            return response;
        }
    }
};

module.exports = finerioController;