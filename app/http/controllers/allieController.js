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

const CHECK_EMAIL = (leadEmail) => {
    leadEmail = JSON.parse(leadEmail);
    let leadEmailTXT = '';

    if(leadEmail.primary != ''){
        leadEmailTXT += leadEmail.primary;
    }

    if(leadEmail.secondary != ''){
        leadEmailTXT += ';'+leadEmail.secondary;
    }

    if(leadEmail.tertiary != ''){
        leadEmailTXT += ';'+leadEmail.tertiary;
    }

    return leadEmailTXT;
}

const TYPE_CREDIT = {
    'simple': 'Simple',
    'revolvente': 'Revolvente',
    'factoraje': 'Factoraje',
    'arrendamiento': 'Arrendamiento',
    'leaseBack': 'Lease Back',
    'puente': 'Puente'
}

const CHECK_TYPE_CREDIT = (typeCredit) => {
    typeCredit = JSON.parse(typeCredit);
    let typeCreditsTXT = '';
    Object.keys(typeCredit).map(tc => {
        if(typeCredit[tc] === true && tc !== 'otro'){
            typeCreditsTXT += TYPE_CREDIT[tc] + ';';
        }
    });

    if(typeCredit['otro'] === true){
        typeCreditsTXT += typeCredit['otroTxt'];
    }
    else{
        typeCreditsTXT = typeCreditsTXT.slice(0, -1)
    }

    return typeCreditsTXT;
}

const TAX_REGIME = {
    'PFAE': 'Persona Física con Actividad Empresarial',
    'PM': 'Persona Moral',
    'RIF': 'Régimen de Incorporación Fiscal',
    'sinAlta': 'Sin Alta en SAT'
}

const CHECK_TAX_REGIME = (taxRegime) => {
    taxRegime = JSON.parse(taxRegime);
    let taxRegimeTXT = '';
    Object.keys(taxRegime).map(tr => {
        if(taxRegime[tr] === true){
            taxRegimeTXT += TAX_REGIME[tr] + ';';
        }
    });
    return taxRegimeTXT.slice(0, -1);
}

const ANTIQUITY = {
    'LESS6': 'Menos de 6 meses',
    'ONE': '1 año',
    'TWO': '2 años',
    'THREE': '3 años',
    'PFOUR': '4 años o más',
}

const FLEXIBILITY = {
    'LITTLE': 'Poca Flexibilidad',
    'MEDIUM': 'Media Flexibilidad',
    'HIGH': 'Alta Flexibilidad'
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
    useOfCredit = JSON.parse(useOfCredit);
    let useOfCreditTXT = '';
    Object.keys(useOfCredit).map(uc => {
        if(useOfCredit[uc] === true){
            useOfCreditTXT += USE_OF_CREDIT[uc] + ';';
        }
    });
    return useOfCreditTXT.slice(0, -1);
}

const allieController = {
    store: async(request, response) => {
        try{
            let data = request.body;
            let {logo} = request.files;
  
            let alianza = data.allieName.replace(/ /g, "");
            let fileName = `${new Date().getTime()}-${alianza}.${logo.mimetype.split("/")[1]}`;
            let locationURIS3 = await fileManager.uploadFileS3(fileName, logo.data, logo.mimetype);

            let dealParams = {
                "properties": [
                    //Información del negocio
                    {
                        "value": data.allieName.trim(),
                        "name": "dealname"
                    },
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
                        "value": CHECK_EMAIL(data.leadEmail),
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
                    //data.until pausada por el momento
                    {
                        "value": `${data.since}`,
                        "name": "amount"
                    },
                    {
                        "value": data.sales,
                        "name": "respuesta_unykoo_2_buro_moral_"
                    },
                    {
                        "value": data.averageRate,
                        "name": "tasa_preaut"
                    },
                    {
                        "value": data.deadline,
                        "name": "plazo_preaut"
                    },
                    {
                        "value": data.openingExpenses,
                        "name": "comision_apertura_preaut"
                    },
                    //Antigüedad mínima del negocio
                    {
                        "value": ANTIQUITY[data.antiquity],
                        "name": "n2_6_antig_edad_del_negocio"
                    },
                    //Flexibilidad en buró
                    {
                        "value": FLEXIBILITY[data.flexibilityCreditBureau],
                        "name": "respuesta_unykoo_1"
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
                    //Apalancamiento aceptado ***Duplicado***
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
                    {
                        "value": locationURIS3,
                        "name": "n9_1_id"
                    },
                    {
                        "value": hubspotAllie.dealstage,
                        "name": "dealstage" 
                    },
                    {
                        "value": hubspotAllie.pipeline,
                        "name": "pipeline"
                    }
                ]
            };

            let hubspotResponse = await axios.post(hubspotAllie.baseURL + 'deals/v1/deal' + hubspotAllie.hapiKey, dealParams);
            
            if(hubspotResponse.status == 200){
                return response.json({ 
                    code: 200,
                    msg: 'Alianza dada de alta exitosamente' 
                });
            }
        }
        catch(error){
            console.log(error.response.data);
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de dar de alta la alianza",
                error: error
            });
        }
    }
}

module.exports = allieController; 