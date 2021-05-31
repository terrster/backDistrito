'use strict'

const axios = require("axios");
const fileManager = require("../services/fileManager");

// #Hubspot - ImpulsoMx
const hubspotAllie = {
    baseURL: 'https://api.hubapi.com/',
    pipeline: '9491843',
    dealstage: '9491844',
    hapiKey: '?hapikey=2c17b627-0c76-4182-b31a-6874e67d32b3'
};

const TYPE_CREDIT = {
    'simple': 'Simple',
    'revolvente': 'Revolvente',
    'factoraje': 'Factoraje',
    'arrendamiento': 'Arrendamiento',
    'leaseBack': 'Lease Back',
    'puente': 'Puente'
}

const CHECK_TYPE_CREDIT = (typeCredit) => {
    let typeCreditsTXT = '';
    Object.keys(typeCredit).map(tc => {
        if(typeCredit[tc] === true && tc !== 'otro'){
            typeCreditsTXT += TYPE_CREDIT[tc] + ';';
        }
        else if(typeCredit['otro'] === true){
            typeCreditsTXT += typeCredit['otroTxt'] + ';';
        }
    });
    return typeCreditsTXT;
}

const TAX_REGIME = {
    'PFAE': 'Persona Física con Actividad Empresarial',
    'PM': 'Persona Moral',
    'RIF': 'Régimen de Incorporación Fiscal',
    'sinAlta': 'Sin Alta en SAT'
}

const CHECK_TAX_REGIME = (taxRegime) => {
    let taxRegimeTXT = '';
    Object.keys(taxRegime).map(tr => {
        if(taxRegime[tr] === true){
            taxRegimeTXT += TAX_REGIME[tr] + ';';
        }
    });
    return taxRegimeTXT;
}

const USE_OF_CREDIT = {
    'compraEquipo': 'Compra de equipo',
    'comprarMercancia': 'Compra de mercancía',
    'consolidarDeudas': 'Consolidar deudas',
    'expansion': 'Expansión',
    'nuevosProyectos': 'Nuevos proyectos',
    'otros': 'Otros',
    'pagosAdministrativos': 'Pagos Administrativos',
    'remodelacion': 'Remodelación'
}

const CHECK_USE_OF_CREDIT = (useOfCredit) => {
    let useOfCreditTXT = '';
    Object.keys(useOfCredit).map(uc => {
        if(useOfCredit[uc] === true){
            useOfCreditTXT += USE_OF_CREDIT[uc] + ';';
        }
    });
    return useOfCreditTXT;
}

const allieController = {
    store: async(request, response) => {
        let data = request.body;
        let files = request.files
        // console.log(data);
        // console.log(files);

        try{
            // await pdf.create(content).toBuffer(async(error, buffer) => {
            //     if(error){
            //         return null;
            //     }

            //     let fileName = `${new Date().getTime()}-${user.name}_${user.lastname}_${user.idDistrito}.pdf`;
            //     locationURIS3 = await fileManager.uploadFileS3(fileName, buffer, 'application/pdf');

            //     await hubspotController.deal.update(user.hubspotDealId, 'single_field', {
            //         name: 'n9_3_12_movimientos_bancarios_openbanking',
            //         value: locationURIS3
            //     });
            // });

            let dealParams = {
                "properties": [
                    //Información general
                    {
                        "value": data.nameMainContact.trim(),
                        "name": "n4_1_nombre"
                    },
                    {
                        "value": data.allieName.trim(),
                        "name": "n3_nombre_comercial"
                    },
                    {
                        "value": data.businessName.trim(),
                        "name": "n3_16_razon_social"
                    },
                    //Correos electronicos
                    {
                        "value": `${data.leadEmail.primary.trim()}${data.leadEmail.secondary != '' ? ';' + data.leadEmail.secondary.trim() : ''}${data.leadEmail.tertiary != '' ? ';' + data.leadEmail.tertiary.trim() : ''}`,
                        "name": "email"
                    },
                    //Tipo de credito que ofreces
                    {
                        "value": CHECK_TYPE_CREDIT(data.typeCredit),
                        "name": "n3_actividad_espec_fica"
                    },
                    //Regimen fiscal aceptado
                    {
                        "value": CHECK_TAX_REGIME(data.taxRegime),
                        "name": "regimen"
                    },
                    //Datos financieros
                    {
                        "value": data.annualSales,
                        "name": "n2_5_ventas_anuales"
                    },
                    {
                        "value": `Desde ${data.since}, hasta ${data.until}`,
                        "name": "amount"
                    },
                    {
                        "value": data.sales,
                        "name": "respuesta_unykoo_2_buro_moral_"
                    },
                    
                    //Antigüedad mínima del negocio
                    {
                        "value": data.antiquity,
                        "name": "n2_6_antig_edad_del_negocio"
                    },
                    //Flexibilidad en buró
                    {
                        "value": data.flexibilityCreditBureau,
                        "name": "telefrespuesta_unykoo_1ono"
                    },
                    //CIEC obligatoria para proceso de crédito
                    {
                        "value": data.ciec,
                        "name": "n4_93_ciec"
                    },
                    //Garantías
                    {
                        "value": data.warranty,
                        "name": "n3_14_garant_a"
                    },
                    //Apalancamiento aceptado ***Duplicado ¿?
                    // {
                    //     "value": data.acceptedLeverage,
                    //     "name": ""
                    // },
                    //Uso del crédito
                    {
                        "value": CHECK_USE_OF_CREDIT(data.useOfCredit),
                        "name": "necesidad_de_financiamiento"
                    },
                    //Logo
                    // {
                    //     "value": data.logo,
                    //     "name": "n9_91_reporte_de_cr_dito"
                    // },
                    {
                        "value": hubspotAllie.dealstage,
                        "name": "dealstage" 
                    }
                ]
            };

            let {data} = await axios.post(hubspotAllie.baseURL + 'deals/v1/deal' + hubspotAllie.hapiKey, dealParams);
            
        }
        catch(error){

        }
    }
}

module.exports = allieController; 