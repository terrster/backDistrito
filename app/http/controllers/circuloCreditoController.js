'use strict'

const hubspotController = require("../controllers/hubspotController");


const circuloCreditoController = {

    alta: async(request, response) => {
        let id = request.params.id;//id de client - hubspot

        try{
            let data = await hubspotController.deal.show(id);

            let params = {
                apellidoPaterno: data.properties.n4_2_apellido_paterno.value,
                apellidoMaterno: data.properties.n4_3_apellido_materno.value,
                primerNombre: data.properties.n5_4_nombre.value,
                fechaNacimiento: data.properties.n4_5_fecha_de_nacimiento.value,
                RFC: data.properties.n3_rfc.value,
                nacionalidad: "Pendiente",
                domicilio: {
                    direccion: "Calle: " + data.properties.n4_6_calle.value + " Ext: " + data.properties.n4_7_num_ext.value + " Int: " + data.properties.n4_8_num_int.value,
                    coloniaPoblacion: data.properties.n4_91_colonia.value,
                    delegacionMunicipio: data.properties.municipio_de_la_persona.value,
                    ciudad: "Pendiente",
                    estado: data.properties.estado_de_la_rep_de_la_persona.value,
                    CP: data.properties.n4_9_c_p_.value
                }
            };

            return response.json({ 
                code: 200,
                params 
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