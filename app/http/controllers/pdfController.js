'user strict'

const pdf = require('html-pdf');
const fs = require('fs');

const User = require("../models/User");

const pdfController = {

    transactions: async(request, response) => {//ID User
        //let idUser = request.headers.tokenDecoded.data.id;

        if(!request.params.id){
            return response.json("User Id no proveído");
        }
        
        let user = await User.findById(request.params.id);

        let credentials = user.idClient.appliance[0].idFinerio.transactions;
        let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        if(credentials.length > 0){
            //style="zoom: 0.60;"

            let desglose = "";

            for(let credential of credentials){
                
                // let desglose_accounts = "";
                desglose += `
                    <br><table style="font-size: 20px;">
                        <tr>
                            <th>Banco</th><td>${credential.bankName}</td>
                            <th>Usuario/Cuenta/Clabe/No. tarjeta</th><td>${credential.username}</td>
                        </tr>
                    </table><br>
                `;

                for(let account of credential.accounts){
                    // let desglose_transactions = "";

                    desglose += `
                        <table>
                            <tr>
                                <th>Nombre de cuenta</th><td>${account.name}</td>
                            </tr>
                        </table>
                    `;
                    
                    Object.keys(account.transactions).map((year) => {
                        //console.log(year) //Year
                        desglose += `
                            <h4>Año ${year}</h4>
                        `;
                        Object.keys(account.transactions[year].data).map((month) => {
                            //console.log(month) //Months
                            desglose += `
                                <h4>${months[month-1]}</h4>
                            `;

                            desglose += `
                                <h4>Depositos</h4>
                                <table id='transactions'>
                                    <thead>
                                        <tr>
                                            <th width="530px">Descripción</th>
                                            <th>Cantidad</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                            `;

                            if(Object.keys(account.transactions[year].data[month].deposito).length !== 0){

                                Object.keys(account.transactions[year].data[month].deposito).map((key) => {
                                    //console.log(account.transactions[year].data[month].deposito[key])
                                    desglose += `
                                        <tr>
                                            <td>${account.transactions[year].data[month].deposito[key].description}</td>
                                            <td>$${account.transactions[year].data[month].deposito[key].amount}</td>
                                            <td>${account.transactions[year].data[month].deposito[key].date}</td>
                                        </tr>
                                    `;
                                });
                            }
                            else{
                                desglose += `
                                    <tr>
                                        <td colspan="3" style="text-align: center">Sin movimientos</td>
                                    </tr>
                                `;
                            }

                            desglose += `
                                    </tbody>
                                </table>
                                <h4>Cargos</h4>
                                <table id='transactions'>
                                    <thead>
                                            <tr>
                                                <th width="530px">Descripción</th>
                                                <th>Cantidad</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                            `;

                            if(Object.keys(account.transactions[year].data[month].cargo).length !== 0){

                                Object.keys(account.transactions[year].data[month].cargo).map((key) => {
                                    // console.log(account.transactions[year].data[month].cargo[key])
                                    desglose += `
                                        <tr>
                                            <td>${account.transactions[year].data[month].cargo[key].description}</td>
                                            <td>$${account.transactions[year].data[month].cargo[key].amount}</td>
                                            <td>${account.transactions[year].data[month].cargo[key].date}</td>
                                        </tr>
                                    `;
                                });

                            }
                            else{
                                desglose += `
                                    <tr>
                                        <td colspan="3" style="text-align: center">Sin movimientos</td>
                                    </tr>
                                `;
                            }

                            desglose += `
                                    </tbody>
                                </table>
                            `;
                        });
                    });
                }
            }

            const content = `
                <html>
                    <head></head>
                    <body>
                        <h1>Desglose de transacciones</h1>

                        ${desglose}           
                        
                        <style>
                            #transactions {
                                font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
                                border-collapse: collapse;
                                width: 100%;
                            }
                            
                            #transactions td, #transactions th {
                                border: 1px solid #ddd;
                                padding: 8px;
                            }
                            
                            #transactions tr:nth-child(even){background-color: #f2f2f2;}
                            
                            #transactions tr:hover {background-color: #ddd;}
                            
                            #transactions th {
                                padding-top: 12px;
                                padding-bottom: 12px;
                                text-align: left;
                                background-color: #4CAF50;
                                color: white;
                            }
                        </style>

                    </body>
                </html>
            `;


            try{
                await pdf.create(content).toBuffer(function(error, buffer){
                    response.header("Access-Control-Allow-Origin", "*");
                    response.header("Access-Control-Allow-Headers", "X-Requested-With");
                    response.header('content-type', 'application/pdf');
                    return response.send(buffer);
                });

            }
            catch(error){
                console.log(error);
            }

        }
        else{
            return response.json("El usuario no tiene transacciones que mostrar");
        }

    }
}

module.exports = pdfController;