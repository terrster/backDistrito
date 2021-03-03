'use strict'

const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://api-burocredito-staging.kikoya.mx/api/v1,' 
    //https://api-burocredito-staging.kikoya.mx/api/v1,
    //https://www.api-burocredito.kikoya.mx/api/v1/
});
const { signRequest } = require("../../../config/kykoya/signer");

const kykoyaController = {
    //Bureau Reports
    createBureauReport: async(request, response) => {
        let requestURI = 'bureau_report';
        
        try{
            let headers = signRequest('POST', requestURI);
            
            return response.json({
                code: 200,
                msg: 'Reporte de buró de crédito creado exitosamente.',
                headers
            });
        }
        catch(error){
            console.log(error);
        }
    },
    getBureauReport: async(request, response) => {
        let id = request.params.id;
        let requestURI = `bureau_reports/${id}`;

        try{
            let headers = signRequest('GET', requestURI);

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