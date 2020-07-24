'user strict'

const pdf = require('html-pdf');
const fs = require('fs');
const hubspotController = require("../controllers/hubspotController");

const solicitudController = {

    aspiria: async(request, response) => {

        const hubspot = await hubspotController.deal.show(request.params.id);

        const content = `
        <html>
        <head></head>
        <body>
          <div>
            <h2 style="margin-bottom: 15px; font-size: 24px; color: #302c64; text-align: right;";>ASPIRIA</P></h2>
            
            <h2 style="margin-bottom: 0px; font-size: 19px; color: #302c64">Solicitud de Crédito</h2>
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Monto:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">$500,000.00</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Plazo:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">12 meses</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Fecha:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">22/06/2020</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Código promocional:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">1180</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">E-mail:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">anapaola@mail.com</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Nombre:</th><td colspan="6" style="border: 1px solid #dddddd; padding: 8px;">${hubspot.properties.n4_1_nombre.value} ${hubspot.properties.n4_2_apellido_paterno.value}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Regimen:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">Persona Moral</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Fecha de nacimiento:</th><td colspan="5" style="border: 1px solid #dddddd; padding: 8px;">22/10/1992</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">RFC:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">UIGA92102257A</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">CURP:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">UIGA921022MMCRMN09</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Nivel máx. de estudios:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">Secundaria</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Años de experiencial laboral:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">10</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">No. de dependientes:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">2</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Estado Civil:</th><td colspan="5" style="border: 1px solid #dddddd; padding: 8px;">Soltero</td>
              </tr>
            </table>
      
            <h2 style="margin-bottom: 15px; font-size: 19px; color: #302c64">Datos de Domicilio</h2>
      
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">C.P:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">53110</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Domicilio:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Cruz de campo santo 73</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Colonia </th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Santa Cruz del Monte</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Ciudad:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">México</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Municipio:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Naucalpan</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Estado:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">México</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px; width: 150px;">Tiempo en domicilio:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">10 años</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Teléfono:</th><td colspan="4" style="border: 1px solid #dddddd; padding: 8px;">5522483811</td>
              </tr>
            </table>
      
            <h2 style="margin-bottom: 15px; font-size: 19px; color: #302c64">Funcionamiento del Negocio</h2>
      
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Años con el negocio:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">5</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">¿En qué se utilizará el recurso?</th><td colspan="5" style="border: 1px solid #dddddd; padding: 8px;">Compra de equipo</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Página web:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">www.google.com.mx</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">TPV:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">Sí</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Tiempo con ella:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">1 año</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Ingresos al año:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">$1,000,000.00</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">¿Ingresos extra?</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">Sí</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Estimado de ingresos extra:</th><td colspan="3" style="border: 1px solid #dddddd; padding: 8px;">$50,000.00</td>
              </tr>
            </table>
      
            <h2 style="margin-bottom: 15px; font-size: 19px; color: #302c64">Datos Bancarios</h2>
      
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Banco:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Bancomer</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">CLABE Interbancaria:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">123456789</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Tiempo con el banco:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">4 años</td>
              </tr>
            </table>
      
            <h2 style="margin-bottom: 15px; font-size: 19px; color: #302c64">Buró de Crédito</h2>
      
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Tarjeta de crédito:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Sí</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">4 Últimos dígitos:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">1234</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Crédito hipotecario:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">No</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Crédito automotriz:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Sí</td>
              </tr>
              <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">¿Representas a un tercero?</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">No</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">¿Es usted o tiene algún familiar políticamente expuesto?</th><td colspan="5" style="border: 1px solid #dddddd; padding: 8px;">No</td>
              </tr>
            </table>

            <div style="page-break-before:always;"></div>
      
            <h2 style="margin-bottom: 15px; font-size: 19px; color: #302c64">Referencias</h2>
    
            <table style="border-collapse: collapse; margin-top: 10px; width: 100%; text-align: left;">
            <tr>
                <th style="padding-bottom: 10px;">Familiares</th>
            </tr>
            <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Nombre:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">Nombre 1</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Teléfono:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">5512345678</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Parentezco:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Familiar</td>
            </tr>
            <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Nombre:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">Nombre 2</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Teléfono:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">5512345678</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Parentezco:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Amigo</td>
            </tr>
            <th style="padding-top: 10px; padding-bottom: 10px;">Arrendador</th>
            <tr>
                <th style="border: 1px solid #dddddd; padding: 8px;">Nombre:</th><td colspan="2" style="border: 1px solid #dddddd; padding: 8px;">Nombre 1</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Teléfono:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">5512345678</td>
                <th style="border: 1px solid #dddddd; padding: 8px;">Parentezco:</th><td colspan="" style="border: 1px solid #dddddd; padding: 8px;">Familiar</td>
            </tr>
            </table>
            
          </div>
        </body>
      </html>
        `;

        try{
            await pdf.create(content).toBuffer(function(error, buffer){
                //response.header("Access-Control-Allow-Origin", "*");
                response.header("Access-Control-Allow-Headers", "X-Requested-With");
                response.header('content-type', 'application/pdf');
                return response.send(buffer);
            });

        }
        catch(error){
            console.log(error);
        }
    }
}


module.exports = solicitudController;