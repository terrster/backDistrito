'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-burocredito-staging.kikoya.mx/api/v1/' 
    //https://api-burocredito-staging.kikoya.mx/api/v1/,
    //https://www.api-burocredito.kikoya.mx/api/v1/
});
const { signRequest } = require("../../../config/kykoya/signer");

const kykoyaController = {
    //Bureau Reports
    createBureauReport: async(request, response) => {
        let requestURI = 'bureau_reports';
        
        try{
            let headers = signRequest('POST', requestURI);

            let API_RESPONSE = await axios.post(requestURI, {
                    "data": {
                       "type": "bureau_report",
                       "attributes": {
                         "query": {
                           "intl": {
                             "operator_reference": "2061841                  ",
                             "responsability_type": "I",
                             "product_type": "PL",
                             "currency": "MX",
                             "lang": "SP"
                           },
                           "pn": {
                             "PN": "ADAMS",
                             "00": "ARIETA",
                             "02": "DIMITRI ARNULFO",
                             "04": "17121950",
                             "05": "BEAS50121757A",
                             "12": "M"
                           },
                           "pa": [
                             { "PA": "PR BOQUES REFORMA114 EDI 2 DEP701",
                               "01": "BOSQUES DE LAS LOMAS",
                               "03": "CUAJIMALPA DE MORELOS",
                               "04": "CDMX",
                               "05": "05120",
                               "13": "MX" }
                           ]
                         }
                       }
                     }
               }, 
                {
                    headers: headers
                }
            );

            console.log(API_RESPONSE.data);
            
            return response.json({
                code: 200,
                msg: 'Reporte de buró de crédito creado exitosamente.'
            });
        }
        catch(error){
            console.log(error);
            // console.log(error.response.status + " | " + error.response.statusText);
            // console.log(error.response.data.errors);
        }
    },
    getBureauReport: async(request, response) => {
        let id = request.params.id;
        let requestURI = `bureau_reports/${id}`;

        try{
            let headers = signRequest('GET', requestURI);

            let API_RESPONSE = await axios.get(requestURI, {
                headers
            });

            console.log(API_RESPONSE.data.attributes.response);

            return response.json({
                code: 200,
                msg: 'Reporte de buró de crédito obtenido exitosamente.',
                headers
            });
        }
        catch(error){
            console.log(error);
        }
    },
    listBureauReports: async(request, response) => {
        let requestURI = 'bureau_reports';

        try{
            let headers = signRequest('GET', requestURI);

            return response.json({
                code: 200,
                msg: 'Reportes de buró de crédito obtenidos exitosamente.',
                headers
            });
        }
        catch(error){
            console.log(error);
        }
    },
    //Prospector
    createProspector: async(request, response) => {
        let requestURI = 'prospectors';
        
        try{
            let headers = signRequest('POST', requestURI);

            return response.json({
                code: 200,
                msg: 'Prospector creado exitosamente.',
                headers
            });
        }
        catch(error){
            console.log(error);
        }
    },
    getProspector: async(request, response) => {
        let id = request.params.id;
        let requestURI = `prospectors/${id}`;

        try{
            let headers = signRequest('GET', requestURI);

            return response.json({
                code: 200,
                msg: 'Prospector obtenido exitosamente.',
                headers
            });
        }
        catch(error){
            console.log(error);
        }
    }
}

module.exports = kykoyaController;