'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'http://api.hubapi.com/',
    headers: {
        'Content-Type': 'application/json'
    }
});
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const hapiKey = "?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3";

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
                        "value": request.name + " " + request.lastName,
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
                        "value": request.idDistrito + " "+ request.name + " " + request.lastName,
                        "name": "dealname"
                    },
                    {
                        "value" : process.env.DATE_HUB,
                        "name": "dealstage" 
                    },
                ]
            };
            
            const {data} = await axios.post('deals/v1/deal' + hapiKey, dealParams);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de crear un deal",
                error: error
            });
        }
    },
    show: async(hubspotDealId) => {
        try{
            const {data} = await axios.get('deals/v1/deal/' + hubspotDealId + hapiKey);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de obtener la información de un deal",
                error: error
            });
        }
    },
    update: async(hubspotDealId, stage, request) => {
        try{
            let dealParams = getParams(stage);

            function getParams(stage){
                switch(stage){
                    case 'type'://tipo de negocio
                        const PERSON_TYPE = {
                            PF: 'Persona Física',
                            RIF: 'RIF',
                            PFAE: 'Persona Física con A.E.',
                            PM: 'Persona Moral',
                        };
                        
                        return {
                            "properties": [
                                {
                                    "value": PERSON_TYPE[request.type],
                                    "name": "tipo_de_persona"
                                }
                            ]
                        }
                    case 'amount'://elige tu monto
                        const REASON = {//whyNeed
                            EXPANSION: "Expansión",
                            NEWPROYECTS: "Nuevos proyectos",
                            MERCHANDISE: "Comprar mercancía",
                            PAYMENTS: "Pagos administrativos",
                            REMODELING: "Remodelación",
                            DEBT: "Consolidar deuda",
                            EQUIPMENT: "Compra de equipo",
                            OTHER: "Otro"
                        };
                        const TERM = {//term
                            ASAP: "Cuanto antes",
                            WAIT: "Puedo esperar"
                        }
                        const OLD = {//old
                            LESS6: "Menos de 6 meses",
                            ONE: "1 año",
                            TWO: "2 años",
                            THREE: "3 años",
                            PFOUR: "4 años o más"
                        };
                        
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
                                    "value": REASON[request.whyNeed],
                                    "name": "necesidad_de_financiamiento"
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
                                    "value": OLD[request.old],
                                    "name": "n2_6_antig_edad_del_negocio"
                                }
                            ]
                        }
                    case 'comercial'://datos comerciales
                        const GYRE = {//gyre
                            COMERCE: "Comercio",
                            SERVICE: "Servicios",
                            PRODUCTS: "Productos",
                            CONSTRUCTION: "Construcción",
                            PRIMARY: "Sector primario",
                            OTROS: "Otro"
                        }
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
                                    "value": GYRE[request.gyre],
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
                                {//exporta a EU, antes TPV
                                    "value": (request.terminal == true || request.terminal == 1 ? 'Sí' : 'No'),
                                    "name": "n3_13_tpv"
                                },
                                {
                                    "value": (request.warranty == true || request.warranty == 1 ? 'Sí' : 'No'),
                                    "name": "n3_14_garant_a"
                                },
                                {//datos comerciales - domicilio negocio
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
                                }             
                            ]
                        }
                    case 'general'://información general
                        const CIVIL_STATUS = {//civilStatus
                            SINGLE: "Soltero",   
                            MARRIED: "Casado", 
                            DIVORCED: "Divorciado", 
                            WIDOWER: "Viudo", 
                        }

                        const CAR = {//carCredit
                            MORE4: 'Hace 4 años o más',
                            YES: "Sí",
                            NO: "No"               
                        }

                        const RELATIVE = {//relative
                            FAMILY: "Familiar",
                            FRIEND: "Amigo",
                            CLIENT: "Cliente" ,
                            PROVIDER: "Proveedor" 
                        }
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
                                    "value": CIVIL_STATUS[request.civilStatus],
                                    "name": "n4_4_estado_civil"
                                },
                                {
                                    "value": request.birthDate,
                                    "name": "n4_5_fecha_de_nacimiento"
                                },
                                {
                                    "value": request.phone,
                                    "name": "n4_92_tel_fono"
                                },
                                {
                                    "value": request.ciec,
                                    "name": "n4_93_ciec"
                                },
                                {
                                    "value": (request.mortgageCredit == '1' || request.mortgageCredit == 1 ? 'Sí' : 'No'),
                                    "name": "n6_1_cr_dito_hipotecario"
                                },
                                {
                                    "value": CAR[request.carCredit],
                                    "name": "n6_2_cr_dito_automotriz"
                                },
                                {
                                    "value": (request.creditCard == '1' || request.creditCard ==  1 ? 'Sí' : 'No'),
                                    "name": "n6_3_tarjeta_de_cr_dito"
                                },
                                {
                                    "value": request.last4,
                                    "name": "n6_4_tdc_4_d_gitos"
                                },
                                {//información general - domicilio
                                    "value": request.street,
                                    "name": "n4_6_calle"
                                },
                                {
                                    "value": request.extNumber,
                                    "name": "n4_7_num_ext"
                                },
                                {
                                    "value": request.intNumber,
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
                                    "value": RELATIVE[request.relative1],
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
                                    "value": RELATIVE[request.relative2],
                                    "name": "n5_6_parentesco"
                                }     
                            ]
                        }
                    case 'documentos'://documentos **********Pendiente
                        return {
                            "properties": [
                                {
                                    "value": request.oficialID,
                                    "name": "n9_1_id"
                                },
                                {
                                    "value": request.oficialID,
                                    "name": "n9_1_2_id"
                                },
                                {
                                    "value": request.oficialID,
                                    "name": "n9_1_3_id"
                                },
                                {
                                    "value": request.oficialID,
                                    "name": "n9_1_4_id"
                                },
                                {
                                    "value": request.proofAddress,
                                    "name": "n9_2_comp_domicilio"
                                },
                                {
                                    "value": request.proofAddress,
                                    "name": "n9_2_1_comp_domicilio_2"
                                },
                                {
                                    "value": request.proofAddress,
                                    "name": "n9_2_2_comp_domicilio_3"
                                },
                                {
                                    "value": request.bankStatements,
                                    "name": "n9_3_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_1_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_2_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_3_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_4_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_5_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_6_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_7_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_8_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_9_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_10_estados_de_cuenta"
                                },
                                {    
                                    "value": request.bankStatements,
                                    "name": "n9_3_11_estados_de_cuenta"
                                },
                                {
                                    "value": request.rfc,
                                    "name": "n9_4_rfc"
                                },
                                {
                                    "value": request.lastDeclarations,
                                    "name": "n9_5_declaraci_n"
                                },
                                {
                                    "value": request.lastDeclarations,
                                    "name": "n9_5_1_declaraci_n"
                                },
                                {
                                    "value": request.lastDeclarations,
                                    "name": "n9_5_2_declaraci_n"
                                },
                                {
                                    "value": request.lastDeclarations,
                                    "name": "n9_5_3_declaraci_n"
                                },
                                {
                                    "value": request.acomplishOpinion,
                                    "name": "n9_6_opini_n_de_cumplimiento"
                                },
                                {
                                    "value": request.facturacion,
                                    "name": "n9_7_xmls"
                                },
                                {
                                    "value": request.otherActs,
                                    "name": "n9_8_otros"
                                },
                                {
                                    "value": request.constitutiveAct,
                                    "name": "n9_9_acta_constitutiva"
                                },
                                {
                                    "value": request.others,
                                    "name": "n9_91_reporte_de_cr_dito"
                                },
                                {
                                    "value": request.others,
                                    "name": "n9_92_1_escritura"
                                },
                                {
                                    "value": request.others,
                                    "name": "n9_92_2_escritura"
                                },
                                {
                                    "value": request.others,
                                    "name": "n9_92_3_escritura"
                                },
                                {
                                    "value": request.financialStatements,
                                    "name": "n9_93_1_eeff"
                                },
                                {
                                    "value": request.financialStatements,
                                    "name": "n9_93_1_1_eeff"
                                },
                                {
                                    "value": request.financialStatements,
                                    "name": "n9_93_2_eeff"
                                }
                                // {
                                //     "value": request,
                                //     "name": "n9_93_2_1_eeff"
                                // },
                                // {
                                //     "value": request,
                                //     "name": "n9_93_3_eeff"
                                // }, 
                                // {
                                //     "value": request,
                                //     "name": "n9_93_3_1_eeff"
                                // }            
                            ]
                        }
                }
            }
            
            const {data} = await axios.put('deals/v1/deal/' + hubspotDealId + hapiKey, dealParams);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de actualizar la información del deal",
                error: error
            });
        }
    }

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
                        "property": "mobilephone"
                    },
                    {
                        "value": request.name,
                        "property": "firstname"
                    },
                    {
                        "value": request.lastName,
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
            console.log({
                msg: "Hubspot: Algo salió mal tratando de crear un contact",
                error: error
            });
        }
    },
    show: async(hubspotContactEmail) => {
        try{
            const {data} = await axios.get('contacts/v1/contact/email/' + hubspotContactEmail + '/profile' + hapiKey);
            return data;
        }
        catch(error){
            console.log({
                msg: "Hubspot: Algo salió mal tratando de obtener la información de un contact",
                error: error
            });
        }
    }

};

module.exports = {
    deal,
    contact
};