'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-v2.finerio.mx/'
});
const finerioCredentials = require("../../../config/finerio_credentials");
const fs = require("fs");
const path = require("path");
const finerio_publicKey = fs.readFileSync(path.resolve("config/finerio_public.key"));
const crypto = require('crypto');

function Encrypt(payload){
    let buffer = Buffer.from(payload, 'utf8');
    let encrypted = crypto.publicEncrypt({key:finerio_publicKey, padding : crypto.constants.RSA_PKCS1_PADDING}, buffer)
    
    return encrypted.toString("base64");
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
            let err = {
                msg: "Finerio: Algo salió mal tratando de obtener los bancos.",
                error: error.response.data.errors
            };

            return response.json(err);
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
    storeCustomer: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.post('customers', {
                name: request.body.name
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.json({
                msg: "Finerio: Cliente creado correctamente.",
                data
            });
        }
        catch(error){
            var err = {
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
                    msg: "Finerio: El identificador name ya ha sido registrado."
                };
            }
   
            return response.json(err);
        }
    },
    getCustomers: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let {data} = await axios.get('customers', {    
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
            let {data} = await axios.delete(`customers/${request.params.id}`, {    
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
    storeCredential: async(request, response) => {
        try{
            let { customerId, bankId, username, password, securityCode } = request.body;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                return response.json(res);
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;

            let token = await finerioCredentials.getToken();
            let result = await axios.post('credentials', {
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
            
            if(result.status == 201 && result.data.status == 'VALIDATE'){
                let res = {
                    msg: "Finerio: La credencial ha sido guardada correctamente, pendiente a validación."
                };

                return response.json(res);
            }
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de registrar una credencial.",
                error: error.response.data
            };

            if(error.response.status == 400 && error.response.data.errors[0].code == 'credential.create.exists'){
                err = {
                    msg: "Finerio: La credencial ya existe."
                };
            }

            return response.json(err);
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
    updateCredential: async(request, response) => {//Funciona pero no actualiza, primero eliminar y volver a guardar la credencial
        try{
            let { customerId, bankId, username, password, securityCode } = request.body;

            if(!customerId || !bankId || !username || !password){
                let res = {
                    msg: "Finerio: Los campos id de cliente, id de institucion bancaria, usuario y contraseña son obligatorios."
                };

                return response.json(res);
            }

            let usernameEncrypted = Encrypt(username);
            let passwordEncrypted = Encrypt(password);
            let securityCodeEncrypted = securityCode ? Encrypt(securityCode) : null;

            let token = await finerioCredentials.getToken();
            let result = await axios.put(`credentials/${request.params.id}`, {
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

            if(result.status == 204){
                let res = {
                    msg: "Finerio: La credencial ha sido actualizada correctamente, pendiente a validación."
                };

                return response.json(res);
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

            return response.json(err);
        }
    },
    deleteCredential: async(request, response) => {
        try{
            let token = await finerioCredentials.getToken();
            let result = await axios.delete(`credentials/${request.params.id}`, {    
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(result.status == 204){
                return response.json({
                    msg: "Finerio: Credencial eliminada correctamente."
                });
            }
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de eliminar una credencial.",
                error: error.response.data.errors
            };

            if(error.response.status == 404 && error.response.data.errors[0].code == 'credential.not.found'){
                err = {
                    msg: "Finerio: La credencial no ha sido encontrada.",
                }
            }

            return response.json(err);
        }
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

            return responese.json(err);
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

            return response.json(data);
        }
        catch(error){
            var err = {
                msg: "Finerio: Algo salió mal tratando de obtener la credencial.",
                error: error.response.data
            };

            return response.json(err);
        }
    }
};

module.exports = finerioController;