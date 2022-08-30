'use strict'
const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api.hubapi.com/',
    headers: {
        "Content-Type": "application/json"
    }
});
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const hapiKey = `?hapikey=${process.env.HAPIKEY}`;
const format = require("../services/formatManager");

const deal = {

    store: async(request) => { 
        try{

            let dealParams = {
                "associations": {
                    "associatedVids": [
                        request.hubspotContactId,
                    ],
                },
                "properties": [
                    {
                        "value": request.idDistrito,
                        "name": "numeroderegistro"
                    },
                    {
                        "value": request.name + " " + request.lastname,
                        "name": "nombre_comercial"
                    },
                    {
                        "value": request.email,
                        "name": "email"
                    },
                    {
                        "value": request.phone,
                        "name": "celular"
                    },
                    {
                        "value": request.prefix ? request.prefix + request.idDistrito + " " + request.name + " " + request.lastname : request.idDistrito + " " + request.name + " " + request.lastname,
                        "name": "dealname"
                    },
                    {
                        "value": request.channel,
                        "name": "canal_de_entrada"
                    },
                    {
                        "value": request.dealstage || process.env.DATE_HUB,
                        "name": "dealstage" 
                    },
                    {
                        "value": request.ipV4,
                        "name": "ip_del_solicitante"
                    }
                ]
            };

            if(request.brokercode){
                try{
                    const response = await axios.get('owners/v2/owners/' + request.brokercode + hapiKey);
        
                    if(response.status == 200){
                        let prueba = await deal.validateBroker(request, response.data);
                        let res;
                        if(prueba.code == 403){
                            res = prueba;
                            return res;
                        } else{
                        dealParams.properties.push({
                            "value": request.brokercode,
                            "name": "hubspot_owner_id"
                        });

                        const {data} = await axios.post('deals/v1/deal' + hapiKey, dealParams);
                        res = data;
                        return res;
                        }
                    }
                }
                catch(error){
                    let response = {
                        code: 403,
                        msg: "El codígo broker no existe"
                    };
        
                    return response;
                }
            }
            else{
                const {data} = await axios.post('deals/v1/deal' + hapiKey, dealParams);
                return data;
            }
            
        }
        catch(error){
            let response = {
                code: 500,
                msg: "Hubspot: Algo salió mal tratando de crear un deal",
                error: error
            };

            return response;
        }
    },
    show: async(request, response) => {
        let id;
        let type_response = '';
        
        if(request.hasOwnProperty('params')){
            id = request.params.id;
            type_response = 'web';
        }
        else{
            id = request;
        }

        try{
            const {data} = await axios.get('deals/v1/deal/' + id + hapiKey);
            if(type_response == 'web'){
                return response.json(data);
            }
            else{
                return data;
            }
        }
        catch(error){
            let response = {
                msg: "Hubspot: Algo salió mal tratando de obtener la información de un deal",
                error: error
            };

            return response;
        }
    },
    delete: async(request, response) => {
        let id = request;

        try{
            const {data} = await axios.delete('deals/v1/deal/' + id + hapiKey);
            
            return data;
        }
        catch(error){
            let response = {
                msg: "Hubspot: Algo salió mal tratando de eliminar un deal",
                error: error
            };

            return response;
        }
    },
    update: async(hubspotDealId, stage, request) => {
        try{
            let dealParams = getParams(stage);

            function getParams(stage){
                switch(stage){
                    case 'single_field':
                        return {
                            "properties": [
                                {
                                    "value": request.value,
                                    "name": request.name
                                }
                            ]
                        };
                    case 'type'://tipo de negocio                        
                        return {
                            "properties": [
                                {
                                    "value": format.PERSON_TYPE[request.type],
                                    "name": "tipo_de_persona"
                                }
                            ]
                        }
                    case 'amount'://elige tu monto
                        return {
                            "properties": [
                                {
                                    "value": request.howMuch,
                                    "name": "amount"
                                },
                                {
                                    "value": request.term,
                                    "name": "n2_2_tiempo_para_pago"
                                },
                                {
                                    "value": request.whenNeed,
                                    "name": "n2_4_urgencia_de_financiamiento"
                                },
                                {
                                    "value": request.yearSales,
                                    "name": "n2_5_ventas_anuales"
                                },
                                {
                                    "value": format.OLD[request.old],
                                    "name": "n2_6_antig_edad_del_negocio"
                                },
                                {
                                    "value": format.REASON[request.whyNeed],
                                    "name": "necesidad_de_financiamiento"
                                },
                                {
                                    "value": request.whyNeedDetails,
                                    "name": "n9_1_03_destino_especifico_del_credito"
                                }
                            ]
                        }
                    case 'comercial'://datos comerciales
                        return {
                            "properties": [
                                {
                                    "value": request.comercialName,
                                    "name": "n3_nombre_comercial"
                                },
                                {
                                    "value": request.businessName,
                                    "name": "n3_16_razon_social"
                                },
                                {
                                    "value": format.GYRE[request.gyre],
                                    "name": "giro"
                                },
                                {
                                    "value": request.specific,
                                    "name": "n3_actividad_espec_fica"
                                },
                                {
                                    "value": request.rfc,
                                    "name": "n3_rfc"
                                },
                                {
                                    "value": request.employeesNumber,
                                    "name": "n3_18_numero_de_empleados"
                                },
                                {
                                    "value": request.bankAccount ? format.YES_NO_QUESTION[request.bankAccount] : '',
                                    "name": "n3_19_cuenta_bancaria_pm"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.paymentsMoreThan30],
                                    "name": "n3_20_clientes_pagan_a_mas_de_30_dias"
                                },
                                {
                                    "value": format.EMPRESARIAL_CREDIT_CARD[request.empresarialCreditCard],
                                    "name": "n3_21_tarjeta_credito_empresarial"
                                },
                                {
                                    "value": request.phone,
                                    "name": "telefono"
                                },
                                {
                                    "value": request.webSite,
                                    "name": "n3_11_sitio_web"
                                },
                                {
                                    "value": request.facebook,
                                    "name": "n3_12_facebook"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.terminal],
                                    "name": "n3_13_tpv"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.exportation],
                                    "name": "n3_17_exportacion"
                                },
                                {
                                    "value": format.WARRANTY[request.warranty],
                                    "name": "n3_14_garant_a"
                                },
                                {
                                    "value": request.ciec,
                                    "name": "n4_93_ciec"
                                },
                                {//datos comerciales - domicilio negocio
                                    "value": request.state,
                                    "name": "estado_de_la_rep_del_negocio"
                                },
                                {
                                    "value": request.municipality,
                                    "name": "municipio_negocio"
                                },
                                {
                                    "value": request.street,
                                    "name": "n3_calle"
                                },
                                {
                                    "value": request.extNumber,
                                    "name": "n3_num_ext"
                                },
                                {
                                    "value": request.intNumber,
                                    "name": "n3_num_int"
                                },
                                {
                                    "value": request.zipCode,
                                    "name": "codigo_postal"
                                },
                                {
                                    "value": request.town,
                                    "name": "n3_9_colonia"
                                },             
                            ]
                        }
                    case 'general'://información general
                        return {
                            "properties": [
                                {
                                    "value": request.name,
                                    "name": "n4_1_nombre"
                                },
                                {
                                    "value": request.lastname,
                                    "name": "n4_2_apellido_paterno"
                                },
                                {
                                    "value": request.secondLastname,
                                    "name": "n4_3_apellido_materno"
                                },
                                {
                                    "value": format.CIVIL_STATUS[request.civilStatus],
                                    "name": "n4_4_estado_civil"
                                },

                                {
                                    "value": request.curp,
                                    "name": "curp"
                                },

                                {
                                    "value": request.birthDate,
                                    "name": "n4_5_fecha_de_nacimiento"
                                },
                                {
                                    "value": format.AGE(request.birthDate),
                                    "name": "n4_94_edad"
                                },
                                {
                                    "value": request.rfcPerson,
                                    "name": "n3_15_rfc_pm"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.bankAccount],
                                    "name": "n4_10_cuenta_bancaria"
                                },
                                {
                                    "value": request.phone,
                                    "name": "n4_92_tel_fono"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.mortgageCredit],
                                    "name": "n6_1_cr_dito_hipotecario"
                                },
                                {
                                    "value": format.CAR_CREDIT[request.carCredit],
                                    "name": "n6_2_cr_dito_automotriz"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.creditCard],
                                    "name": "n6_3_tarjeta_de_cr_dito"
                                },
                                {
                                    "value": request.last4 ? request.last4 : '',
                                    "name": "n6_4_tdc_4_d_gitos"
                                },
                                {//información general - domicilio
                                    "value": request.state,
                                    "name": "estado_de_la_rep_de_la_persona"
                                },
                                {
                                    "value": request.municipality,
                                    "name": "municipio_de_la_persona"
                                },
                                {
                                    "value": request.street,
                                    "name": "n4_6_calle"
                                },
                                {
                                    "value": request.extNumber,
                                    "name": "n4_7_num_ext"
                                },
                                {
                                    "value": request.intNumber ? request.intNumber : '',
                                    "name": "n4_8_num_int"
                                },
                                {
                                    "value": request.zipCode,
                                    "name": "n4_9_c_p_"
                                },
                                {
                                    "value": request.town,
                                    "name": "n4_91_colonia"
                                },//información general - referencia1
                                {
                                    "value": request.name1,
                                    "name": "n5_1_nombre_referencia"
                                },
                                {
                                    "value": request.phone1,
                                    "name": "n5_2_tel_fono_referencia"
                                },
                                {
                                    "value": format.RELATIVE[request.relative1],
                                    "name": "n5_3_parentesco_referencia"
                                },//información general - referencia2
                                {
                                    "value": request.name2,
                                    "name": "n5_4_nombre"
                                },
                                {
                                    "value": request.phone2,
                                    "name": "n5_5_tel_fono"
                                },
                                {
                                    "value": format.RELATIVE[request.relative2],
                                    "name": "n5_6_parentesco"
                                }     
                            ]
                        }
                    case 'documents'://documentos
                        let data = [];
                        if(request.oficialID){
                            if(Array.isArray(request.oficialID)){
                                if(request.oficialID[0]){
                                    data.push({
                                        "value": request.oficialID[0],
                                        "name": "n9_1_id"
                                    });
                                }
                                if(request.oficialID[1]){
                                    data.push({
                                        "value": request.oficialID[1],
                                        "name": "n9_1_2_id"
                                    });
                                }
                                if(request.oficialID[2]){
                                    data.push({
                                        "value": request.oficialID[2],
                                        "name": "n9_1_3_id"
                                    });
                                }
                                if(request.oficialID[3]){
                                    data.push({
                                        "value": request.oficialID[3],
                                        "name": "n9_1_4_id"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.oficialID,
                                    "name": "n9_1_id"
                                });
                            }
                        }

                        if(request.proofAddress){
                            if(Array.isArray(request.proofAddress)){
                                if(request.proofAddress[0]){
                                    data.push({
                                        "value": request.proofAddress[0],
                                        "name": "n9_2_comp_domicilio"
                                    });
                                }
                                if(request.proofAddress[1]){
                                    data.push({
                                        "value": request.proofAddress[1],
                                        "name": "n9_2_1_comp_domicilio_2"
                                    });
                                }
                                if(request.proofAddress[2]){
                                    data.push({
                                        "value": request.proofAddress[2],
                                        "name": "n9_2_2_comp_domicilio_3"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.proofAddress,
                                    "name": "n9_2_comp_domicilio"
                                });
                            }
                        }

                        if(request.proofAddressMainFounders){
                            if(Array.isArray(request.proofAddressMainFounders)){
                                if(request.proofAddressMainFounders[0]){
                                    data.push({
                                        "value": request.proofAddressMainFounders[0],
                                        "name": "n9_2_comp_domicilio"
                                    });
                                }
                                if(request.proofAddressMainFounders[1]){
                                    data.push({
                                        "value": request.proofAddressMainFounders[1],
                                        "name": "n9_2_1_comp_domicilio_2"
                                    });
                                }
                                if(request.proofAddressMainFounders[2]){
                                    data.push({
                                        "value": request.proofAddressMainFounders[2],
                                        "name": "n9_2_2_comp_domicilio_3"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.proofAddressMainFounders,
                                    "name": "n9_2_comp_domicilio"
                                });
                            }
                        }

                        if(request.bankStatements){
                            if(Array.isArray(request.bankStatements)){
                                if(request.bankStatements[0]){
                                    data.push({
                                        "value": request.bankStatements[0],
                                        "name": "n9_3_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[1]){
                                    data.push({    
                                        "value": request.bankStatements[1],
                                        "name": "n9_3_1_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[2]){
                                    data.push({    
                                        "value": request.bankStatements[2],
                                        "name": "n9_3_2_estados_de_cuenta"
                                    });

                                }
                                if(request.bankStatements[3]){
                                    data.push({    
                                        "value": request.bankStatements[3],
                                        "name": "n9_3_3_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[4]){
                                    data.push({    
                                        "value": request.bankStatements[4],
                                        "name": "n9_3_4_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[5]){
                                    data.push({    
                                        "value": request.bankStatements[5],
                                        "name": "n9_3_5_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[6]){
                                    data.push({    
                                        "value": request.bankStatements[6],
                                        "name": "n9_3_6_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[7]){
                                    data.push({    
                                        "value": request.bankStatements[7],
                                        "name": "n9_3_7_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[8]){
                                    data.push({    
                                        "value": request.bankStatements[8],
                                        "name": "n9_3_8_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[9]){
                                    data.push({    
                                        "value": request.bankStatements[9],
                                        "name": "n9_3_9_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[10]){
                                    data.push({    
                                        "value": request.bankStatements[10],
                                        "name": "n9_3_10_estados_de_cuenta"
                                    });
                                }
                                if(request.bankStatements[11]){
                                    data.push({    
                                        "value": request.bankStatements[11],
                                        "name": "n9_3_11_estados_de_cuenta"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.bankStatements,
                                    "name": "n9_3_estados_de_cuenta"
                                });
                            }
                        }

                        if(request.constitutiveAct){
                            if(Array.isArray(request.constitutiveAct)){
                                if(request.constitutiveAct[0]){
                                    data.push({
                                        "value": request.constitutiveAct[0],
                                        "name": "n9_9_acta_constitutiva"
                                    });
                                }
                                if(request.constitutiveAct[1]){
                                    data.push({
                                        "value": request.constitutiveAct[1],
                                        "name": "n9_92_1_escritura"
                                    });
                                }
                                if(request.constitutiveAct[2]){
                                    data.push({
                                        "value": request.constitutiveAct[2],
                                        "name": "n9_92_2_escritura"
                                    });
                                }
                                if(request.constitutiveAct[3]){
                                    data.push({
                                        "value": request.constitutiveAct[3],
                                        "name": "n9_92_3_escritura"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.constitutiveAct,
                                    "name": "n9_9_acta_constitutiva"
                                });
                            }
                        }

                        if(request.financialStatements){
                            if(Array.isArray(request.financialStatements)){
                                if(request.financialStatements[0]){
                                    data.push({
                                        "value": request.financialStatements[0],
                                        "name": "n9_93_1_eeff"
                                    });
                                }
                                if(request.financialStatements[1]){
                                    data.push({
                                        "value": request.financialStatements[1],
                                        "name": "n9_93_1_1_eeff"
                                    });
                                }
                                if(request.financialStatements[2]){
                                    data.push({
                                        "value": request.financialStatements[2],
                                        "name": "n9_93_2_eeff"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.financialStatements,
                                    "name": "n9_93_1_eeff"
                                });
                            }
                        }

                        if(request.rfc){
                            data.push({
                                "value": request.rfc,
                                "name": "n9_4_rfc"
                            });
                        }

                        if(request.lastDeclarations){
                            if(Array.isArray(request.lastDeclarations)){
                                if(request.lastDeclarations[0]){
                                    data.push({
                                        "value": request.lastDeclarations[0],
                                        "name": "n9_5_declaraci_n"
                                    });
                                }
                                if(request.lastDeclarations[1]){
                                    data.push({
                                        "value": request.lastDeclarations[1],
                                        "name": "n9_5_1_declaraci_n"
                                    });
                                }
                                if(request.lastDeclarations[2]){
                                    data.push({
                                        "value": request.lastDeclarations[2],
                                        "name": "n9_5_2_declaraci_n"
                                    });
                                }
                                if(request.lastDeclarations[3]){
                                    data.push({
                                        "value": request.lastDeclarations[3],
                                        "name": "n9_5_3_declaraci_n"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.lastDeclarations,
                                    "name": "n9_5_declaraci_n"
                                });
                            }
                        }

                        // if(request.acomplishOpinion){
                        //     data.push({
                        //         "value": request.acomplishOpinion,
                        //         "name": "n9_6_opini_n_de_cumplimiento"
                        //     });
                        // }

                        if(request.facturacion){
                            data.push({
                                "value": request.facturacion,
                                "name": "n9_7_xmls"
                            });
                        }

                        if(request.others){
                            if(Array.isArray(request.others)){
                                if(request.others[0]){
                                    data.push({
                                        "value": request.others[0],
                                        "name": "n9_8_otros"
                                    });
                                }
                                if(request.others[1]){
                                    data.push({
                                        "value": request.others[1],
                                        "name": "n9_8_1_otros_2"
                                    });
                                }
                                if(request.others[2]){
                                    data.push({
                                        "value": request.others[2],
                                        "name": "n9_8_2_otros_3"
                                    });
                                }
                                if(request.others[3]){
                                    data.push({
                                        "value": request.others[3],
                                        "name": "n9_8_3_otros_4"
                                    });
                                }
                            }
                            else{
                                data.push({
                                    "value": request.others,
                                    "name": "n9_8_otros"
                                });
                            }
                        }

                        if(request.collectionReportSaleTerminals){
                            data.push({
                                "value": request.collectionReportSaleTerminals,
                                "name": "n9_94_reporte_de_cobranza_tpv"
                            });
                        }

                        if(request.localContractLease){
                            data.push({
                                "value": request.localContractLease,
                                "name": "n9_95_contrato_de_arrendamiento_tpv"
                            });
                        }

                        let params = {
                            "properties": data
                        };

                        return params;

                    case 'documents-update'://documentos update
                        return {
                            "properties": [
                                {
                                    "value": request.value,
                                    "name": request.name
                                }
                            ]
                        }
                    case 'buro' : //buro
                        return {
                            "properties": [
                                {
                                    "value": request.score,
                                    "name": "score_bc"
                                },
                                {
                                    "value": request.idConsulta,
                                    "name": "n10_1_id_unykoo"
                                },
                                {
                                    "value": request.status,
                                    "name": "estatus_workflow_unykoo"
                                }
                            ]
                        }
                        case 'generalBuro'://información general
                        return {
                            "properties": [
                                {
                                    "value": request.name,
                                    "name": "n4_1_nombre"
                                },
                                {
                                    "value": request.lastname,
                                    "name": "n4_2_apellido_paterno"
                                },
                                {
                                    "value": request.secondLastname,
                                    "name": "n4_3_apellido_materno"
                                },
                                {
                                    "value": request.rfcPerson,
                                    "name": "n3_15_rfc_pm"
                                },
                                {
                                    "value": request.curp,
                                    "name": "curp"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.mortgageCredit],
                                    "name": "n6_1_cr_dito_hipotecario"
                                },
                                {
                                    "value": format.CAR_CREDIT[request.carCredit],
                                    "name": "n6_2_cr_dito_automotriz"
                                },
                                {
                                    "value": format.YES_NO_QUESTION[request.creditCard],
                                    "name": "n6_3_tarjeta_de_cr_dito"
                                },
                                {
                                    "value": request.last4 ? request.last4 : '',
                                    "name": "n6_4_tdc_4_d_gitos"
                                },
                            ]
                        }
                }
            }
            const {data} = await axios.put('deals/v1/deal/' + hubspotDealId + hapiKey, dealParams);
            return data;
        }
        catch(error){
            let response = {
                msg: "Hubspot: Algo salió mal tratando de actualizar la información del deal",
                error: error
            };

            // console.log(response);
            return response;
        }
    },
    validateBroker: async (request, data) => {
        let name = request.name + " " + request.lastname;
        let broker = data.firstName + " " + data.lastName;
        let emailBroker = data.email;
        let correoBroker;
        let telephone;
        let response;
        try{
            let prueba = await axios.post('crm/v3/objects/deals/search' + hapiKey, {
                "filters": [
                    {
                        "value": request.brokercode,
                        "propertyName": "numeroderegistro",
                        "operator":"EQ"
                        },
                    ]
            });
            if(prueba.status == 200){
            if(prueba.data.results.length > 0){
                let Id = prueba.data.results[0].id;
                let broker = await axios.get('crm/v3/objects/deals/'+Id+ hapiKey +'&properties=telefono,email');
                let {telefono, email} = broker.data.properties;
                telephone = telefono;
                correoBroker = email;
            }
                
            if(name.toLowerCase() == broker.toLowerCase()){
                response = {
                    code: 403,
                    msg: "El nombre del  cliente no debe ser el nombre del broker"
                    };
                
                return response;
                }else if((emailBroker == request.email) || (correoBroker == request.email )){
                response = {
                    code: 403,
                    msg: "El Email del cliente no puede ser igual al email del  broker"
                };
                
                return response;
                } else if(telephone == request.phone){
                    response = {
                        code: 403,
                        msg: "El telefono tiene que ser diferente al del broker",}
                    return response;
                }else {
                response = {
                code: 200,
                msg: "Todo ok"
                };
                }
                return response;
            }
        }catch(error){
            console.log(error);
            response = {
                code: 403,
                msg: "ERR"
                };
            return response;
            
        }
    },
    broker: async (brokercode, data) => {
        try{
            let prueba = await axios.post('crm/v3/objects/deals/search' + hapiKey, {
                "filters": [
                    {
                        "value": brokercode,
                        "propertyName": "numeroderegistro",
                        "operator":"EQ"
                        },
                    ]
            });
            if(prueba.status == 200){
                if(prueba.data.results.length > 0){
                    let Id = prueba.data.results[0].id;
                    let broker = await axios.get('crm/v3/objects/deals/'+Id+ hapiKey +'&properties=telefono,email');
                    let {telefono, email} = broker.data.properties;
                    return {telefono, email};
                }
            } else {
                return false;
            }

        } catch(error){
            console.log(error);
            return false;
        }
    },
    getScore: async (request) => {
        try{
            const {data} = await axios.get('crm/v3/objects/deals/' + request + hapiKey + '&properties=score_bc');
            let score = data.properties.score_bc;
            score = score === undefined ? "no" : score === "" ? "no" : parseInt(score);
            return score;

        } catch(error){
            console.log(error);
            return false;
        }
    },

};

const contact = {

    store: async(request) => {
        try{
            let contactParams = {
                "properties": [
                    {
                        "value": request.email,
                        "property": "email"
                    },
                    {
                        "value": request.phone,
                        "property": "phone"
                    },
                    {
                        "value": request.name,
                        "property": "firstname"
                    },
                    {
                        "value": request.lastname,
                        "property": "lastname"
                    },
                    {
                        "property": "company",
                        "value": "HubSpot"
                    }
                ]
            };

            const {data} = await axios.post('contacts/v1/contact' + hapiKey, contactParams);
            return data;
        }
        catch(error){
            let response = {
                msg: "Hubspot: Algo salió mal tratando de crear un contact",
                error: error
            };

            // console.log(response);
            return response;
        }
    },
    getByEmail: async(email) => {
        try{
            const response = await axios.get('contacts/v1/contact/email/' + email + '/profile' + hapiKey);

            if(response.status == 200){
                return response.data;
            }
        }
        catch(error){
            return null;
        }
    },
    show: async(hubspotContactId) => {
        try{
            const {data} = await axios.get('contacts/v1/contact/vid/' + hubspotContactId + '/profile' + hapiKey);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de obtener la información de un contact",
                error: error
            });
        }
    },
    update: async(hubspotContactId, request) => {
        try{
            let contactParams = {
                "properties": [
                    {
                        "value": request.email.toLowerCase().trim(),
                        "property": "email"
                    },
                    {
                        "value": request.phone,
                        "property": "mobilephone"
                    },
                    {
                        "value": request.name,
                        "property": "firstname"
                    },
                    {
                        "value": request.lastname,
                        "property": "lastname"
                    }
                ]
            };
            const {data} = await axios.post('contacts/v1/contact/vid/' + hubspotContactId + '/profile' + hapiKey, contactParams);
            return data;
        }
        catch(error){
            let response = {
                msg: "Hubspot: Algo salió mal tratando de actualizar la información de un contact",
                error: error
            };

            return response;
        }
    },
    delete: async(hubspotContactId) => {
        try{
            const response = await axios.delete('contacts/v1/contact/vid/' + hubspotContactId + hapiKey);

            if(response.status == 200){
                return response.data;
            }
        }
        catch(error){
            return null;
        }
    }

};

module.exports = {
    deal,
    contact
};