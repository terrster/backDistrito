'use strict'

const hubspotController = require("../controllers/hubspotController");
const _axios = require("axios").default;
const axios = _axios.create({
    baseURL: 'https://services.circulodecredito.com.mx/sandbox/v2/',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key' : 'uh1Z7TIGfqwBimnRKCx9AORVZCm3yvH9'
    }
});
const moment = require("moment");

const circuloCreditoController = {

    alta: async(request, response) => {
        let id = request.params.id;//id de client - hubspot

        try{
            let hubspot = await hubspotController.deal.show(id);
            let estado = hubspot.properties.estado_de_la_rep_de_la_persona.value.toUpperCase();
            let birthDate = new Date(hubspot.properties.n4_5_fecha_de_nacimiento.value);
            birthDate = moment(birthDate).format('YYYY-DD-MM');

            let params = {
                "apellidoPaterno": hubspot.properties.n4_2_apellido_paterno.value.toUpperCase(),
                "apellidoMaterno": hubspot.properties.n4_3_apellido_materno.value.toUpperCase(),
                "primerNombre": hubspot.properties.n4_1_nombre.value.toUpperCase(),
                "fechaNacimiento": birthDate,
                "RFC": hubspot.properties.n3_rfc.value,
                "nacionalidad": "MX",
                "domicilio": {
                    "direccion": (hubspot.properties.n4_6_calle.value + " " + hubspot.properties.n4_7_num_ext.value).toUpperCase(),
                    "coloniaPoblacion": hubspot.properties.n4_91_colonia.value.toUpperCase(),
                    "delegacionMunicipio": hubspot.properties.municipio_de_la_persona.value.replace(".", "", "gi").toUpperCase(),
                    "ciudad": hubspot.properties.estado_de_la_rep_de_la_persona.value.toUpperCase(),
                    "estado": estado == 'CIUDAD DE MÉXICO' ? 'CDMX' : estado,
                    "CP": hubspot.properties.n4_9_c_p_.value
                }
            };

            let {data} = await axios.post('rccficoscore', params);

            return response.json({ 
                code: 200,
                data 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información de un deal",
                error: error
            });
        }
    }

}

module.exports = circuloCreditoController;