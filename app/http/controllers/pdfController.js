'user strict'

const pdf = require('html-pdf');
const fs = require('fs');
const User = require("../models/User");

const pdfController = {

    transactions: async(request, response) => {//ID Distrito
        let id_Distrito = request.params.id;

        if(!request.params.id){
            return response.json("Id Distrito no proveído");
        }
        
        let user = await User.findOne({idDistrito: id_Distrito});

        let credentials = user.idClient.appliance[0].idFinerio.transactions;
        let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        if(credentials.length > 0){
            //style="zoom: 0.60;"

            let desglose = "";
            let count = 0;

            for(let credential of credentials){
                
                // let desglose_accounts = "";
                if(count > 0){
                    desglose += `
                        <div style="page-break-after: always;"></div>
                    `;
                }

                desglose += `
                    <br>
                        <table class="table-dp">
                            <thead>
                                <tr>
                                    <th>Banco</th>
                                    <th>Usuario/Cuenta/Clabe/No. tarjeta</th>
                                    <th>Cuenta verificada</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${credential.bankName}</td>
                                    <td>${credential.username}</td>
                                    <td>${credential.sameOwner ? 'Verificada' : 'No verificada'}</td>
                                </tr>
                            </tbody>
                        </table>
                    <br>
                `;

                for(let account of credential.accounts){

                    if(Object.keys(account.transactions).length !== 0){

                        desglose += `
                            <table class="table-dp" style="margin-top: 15px">
                                <thead>
                                    <tr>
                                        <th>Nombre de cuenta</th>
                                        <th>Propietario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${account.name}</td>
                                        <td>${account.owner}</td>
                                    </tr>
                                </tbody>
                            </table>
                        `;
                    
                        Object.keys(account.transactions).map((year) => {
                            //console.log(year) //Year
                            desglose += `
                                <h4 style="text-align:right; padding-top:5px;">Año ${year}</h4>
                            `;
                            Object.keys(account.transactions[year].data).map((month) => {
                                //console.log(month) //Months
                                desglose += `
                                    <h4 style="text-align:center; padding-top:7px;">${months[month-1]}</h4>
                                `;

                                desglose += `
                                    <h4>Depositos</h4>
                                    <table class='table-dp'>
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

                                    var tdepositos = 0;

                                    Object.keys(account.transactions[year].data[month].deposito).map((key) => {
                                        //console.log(account.transactions[year].data[month].deposito[key])
                                        desglose += `
                                            <tr>
                                                <td>${account.transactions[year].data[month].deposito[key].description}</td>
                                                <td>$${new Intl.NumberFormat().format(account.transactions[year].data[month].deposito[key].amount)}</td>
                                                <td>${account.transactions[year].data[month].deposito[key].date}</td>
                                            </tr>
                                        `;
                                        tdepositos += account.transactions[year].data[month].deposito[key].amount;
                                    });

                                    desglose += `
                                        </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>Total</td>
                                                    <td colspan="2">$${new Intl.NumberFormat().format(tdepositos)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    `;
                                }
                                else{
                                    desglose += `
                                            <tr>
                                                <td colspan="3" style="text-align: center">Sin movimientos</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    `;
                                }

                                desglose += `
                                    <h4>Cargos</h4>
                                    <table class='table-dp'>
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

                                    var tcargos = 0;

                                    Object.keys(account.transactions[year].data[month].cargo).map((key) => {
                                        // console.log(account.transactions[year].data[month].cargo[key])
                                        desglose += `
                                            <tr>
                                                <td>${account.transactions[year].data[month].cargo[key].description}</td>
                                                <td>$${new Intl.NumberFormat().format(account.transactions[year].data[month].cargo[key].amount)}</td>
                                                <td>${account.transactions[year].data[month].cargo[key].date}</td>
                                            </tr>
                                        `;
                                        tcargos += account.transactions[year].data[month].cargo[key].amount;
                                    });
                                    desglose += `
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>Total</td>
                                                    <td colspan="2">$${new Intl.NumberFormat().format(tcargos)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    `;
                                }
                                else{
                                    desglose += `
                                            <tr>
                                                <td colspan="3" style="text-align: center">Sin movimientos</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    `;
                                }
                            });

                            desglose += `
                                <h4>Última transacción del año</h4>

                                <table class='table-dp'>
                                    <thead>
                                        <tr>
                                            <th width="530px">Descripción</th>
                                            <th>Cantidad</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${account.transactions[year].last_transaction.description}</td>
                                            <td>$${new Intl.NumberFormat().format(account.transactions[year].last_transaction.amount)}</td>
                                            <td>${account.transactions[year].last_transaction.date}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style="page-break-after: always;"></div>
                            `;
                        });


                    }
                    else{
                        desglose += `
                            <table class="table-dp" style="margin-top: 15px">
                                <thead>
                                    <tr>
                                        <th>Nombre de cuenta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${account.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center">Sin transacciones que mostrar</td>
                                    </tr>
                                </tbody>
                            </table>
                        `;
                    }
                }
                count++;
            }

            const content = `
                <html style="zoom: 0.60;">
                    <head>
                        <link rel="stylesheet" src="../../../public/assets/pdf.css">
                    </head>
                    <body>
                        <h1 class="title-dp">Desglose de transacciones</h1>
                        <h3>Movimientos obtenidos por Distrito Pyme con tecnología Open Banking. Esta información se obtuvo 
                        conectándonos directamente a los servidores del banco correspondiente con los accesos 
                        proporcionados por el solicitante de crédito.</h3>

                        <table class="table-dp" style="margin-top: 15px">
                            <thead>
                                <tr>
                                    <th>ID Distrito Pyme</th>
                                    <th>Nombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${user.idDistrito}</td>
                                    <td>${user.name + ' ' + user.lastname}</td>
                                </tr>
                            </tbody>
                        </table>

                        ${desglose}           
                        
                        <style>
                            body{
                                font-family: 'Metropolis-Regular', sans-serif;
                                padding:5px 0px 5px 0px;
                            }

                            .title-dp{
                                color: #2A2E59;
                            }

                            .table-dp{
                                font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
                                border-collapse: collapse;
                                width: 100%;
                                page-break-inside: avoid;
                            }
                            
                            .table-dp td, .table-dp th {
                                border: 1px solid #ddd;
                                padding: 4px;
                            }
                            
                            .table-dp tr:nth-child(even){
                                background-color: #f2f2f2;
                            }
                            
                            .table-dp tr:hover {
                                background-color: #ddd;
                            }
                            
                            .table-dp th {
                                
                                text-align: left;
                                background-color: #2A2E59;
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