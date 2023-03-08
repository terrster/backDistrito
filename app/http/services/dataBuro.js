const axios = require("axios");
const Control = require("../models/Control");
const Consultas = require("../models/Consultas");
const Buro = require("../models/BuroM");
const Client = require("../models/Client");
const hubspotController = require("../controllers/hubspotController");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const qs = require("qs");

const codigoEstado = (estado) => {
  estado = estado.toUpperCase();
  switch (estado) {
    case "AGUASCALIENTES":
      return "AGS";
    case "BAJA CALIFORNIA":
      return "BCN";
    case "BAJA CALIFORNIA SUR":
      return "BCS";
    case "CAMPECHE":
      return "CAM";
    case "COAHUILA":
      return "COA";
    case "COLIMA":
      return "COL";
    case "CHIAPAS":
      return "CHS";
    case "CHIHUAHUA":
      return "CHI";
    case "CIUDAD DE MEXICO":
      return "CDMX";
    case "DURANGO":
      return "DGO";
    case "GUANAJUATO":
      return "GTO";
    case "GUERRERO":
      return "GRO";
    case "HIDALGO":
      return "HGO";
    case "JALISCO":
      return "JAL";
    case "MEXICO":
    case "ESTADO DE MEXICO":
    case "MEXICO ESTADO DE":
    case "MÉXICO":
      return "EM";
    case "MICHOACAN":
      return "MICH";
    case "MORELOS":
      return "MOR";
    case "NAYARIT":
      return "NAY";
    case "NUEVO LEON":
      return "NL";
    case "OAXACA":
      return "OAX";
    case "PUEBLA":
      return "PUE";
    case "QUERETARO":
      return "QRO";
    case "QUINTANA ROO":
      return "QR";
    case "SAN LUIS POTOSI":
      return "SLP";
    case "SINALOA":
      return "SIN";
    case "SONORA":
      return "SON";
    case "TABASCO":
      return "TAB";
    case "TAMAULIPAS":
      return "TAM";
    case "TLAXCALA":
      return "TLAX";
    case "VERACRUZ":
      return "VER";
    case "YUCATAN":
      return "YUC";
    case "ZACATECAS":
      return "ZAC";
    default:
      return "EM";
  }
};

async function getToken(type) {
  let name =
    type === "PPF"
      ? "Prospector"
      : type === "RPF"
      ? "Reporte Persona Fisica"
      : "Reporte Moral";
  let person = type === "PPF" || type === "RPF" ? "PF" : "PM";
  let control = await Control.findOne({ name: name });

  const CLIENT_ID =
    person === "PM" ? process.env.CLIENT_ID_PM : process.env.CLIENT_ID_PF;
  const CLIENT_SECRET =
    person === "PM"
      ? process.env.CLIENT_SECRET_PM
      : process.env.CLIENT_SECRET_PF;
  const SCOPE = person === "PM" ? process.env.SCOPE_PM : process.env.SCOPE_PF;

  let USER = control.userBuro;
  let PASSWORD = control.passwordBuro;

  let data = qs.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: USER,
    password: PASSWORD,
    Scope: SCOPE,
    grant_type: "password",
  });
  let config = {
    method: "post",
    url: "https://api.burodecredito.com.mx:4431/auth/oauth/v2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  let success = null;
  let token = null;

  // console.log("Configuración de token:" + JSON.stringify(config));

  await axios(config)
    .then(function (response) {
      success = true;
      token = response.data.access_token;
    })
    .catch(function (error) {
      console.log("error al obtener token");
      if (error.response.data) {
        console.log(error.response.data);
      } else {
        console.log(error);
      }
      success = false;
      token = error.response.data ? error.response.data : error;
    });

  return {
    success: success,
    token: token,
  };
}

async function getTokenPÑruebas() {
  let data = qs.stringify({
    grant_type: "client_credentials",
  });
  let config = {
    method: "post",
    url: "https://apigateway1.burodecredito.com.mx:8443/auth/oauth/v2/token",
    headers: {
      Authorization:
        "Basic bDdmNGFiOTYxOTkyMzM0MzA2OWUzYTQ4YzMyMDliNjFlNDplZTliYTY5OWU5ZjU0Y2Q3YmJlNzk0OGUwODg0Y2NjOQ==",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  let success = null;
  let token = null;

  await axios(config)
    .then(function (response) {
      success = true;
      token = response.data.access_token;
    })
    .catch(function (error) {
      console.log(error);
      success = false;
      token = error;
    });
}

const removeAccents = (str) => {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return str.toUpperCase();
};

const dataBuro = {
  async dataBuroReporte({ general, referenciaOperador, rfc }) {
    const url =
      "https://api.burodecredito.com.mx:4431/pf/autenticador/credit-report-api/v1/autenticador";
    const data = JSON.stringify({
      consulta: {
        persona: {
          autentica: {
            ejercidoCreditoAutomotriz: general.carCredit !== "NO" ? "V" : "F",

            ejercidoCreditoHipotecario: general.mortgageCredit ? "V" : "F",

            referenciaOperador: referenciaOperador,

            tarjetaCredito: general.creditCard ? "V" : "F",

            tipoReporte: "RCN",

            tipoSalidaAU: general.tipoSalidaAU ? general.tipoSalidaAU : "1",

            ultimosCuatroDigitos: general.last4,
          },

          cuentaC: [
            {
              claveOtorgante: "",

              nombreOtorgante: "",

              numeroCuenta: "",
            },
          ],

          domicilios: [
            {
              ciudad: "",

              codPais: "MX",

              coloniaPoblacion: general.address.town,

              cp: general.address.zipCode,

              delegacionMunicipio: general.address.municipality,

              direccion1: `${general.address.street} ${
                general.address.extNumber ? `${general.address.extNumber}` : ""
              }`,

              direccion2: general.address.intNumber
                ? `INT ${general.address.intNumber}`
                : "",

              estado: codigoEstado(general.address.state),

              extension: "",

              fax: "",

              fechaResidencia: "",

              indicadorEspecialDomicilio: "",

              numeroTelefono: "",

              tipoDomicilio: "",
            },
          ],

          empleos: [
            {
              baseSalarial: "",

              cargo: "",

              ciudad: "",

              claveMonedaSalario: "",

              codPais: "",

              coloniaPoblacion: "",

              cp: "",

              delegacionMunicipio: "",

              direccion1: "",

              direccion2: "",

              estado: "",

              extension: "",

              fax: "",

              fechaContratacion: "",

              fechaUltimoDiaEmpleo: "",

              nombreEmpresa: "",

              numeroEmpleado: "",

              numeroTelefono: "",

              salario: "",
            },
          ],

          encabezado: {
            clavePais: "MX",

            claveUnidadMonetaria: " ",

            identificadorBuro: "",

            idioma: "SP",

            importeContrato: "",

            numeroReferenciaOperador: referenciaOperador,

            productoRequerido: "007",

            tipoConsulta: "I",

            tipoContrato: "CL",
          },

          nombre: {
            apellidoPaterno: general.lastname,

            apellidoMaterno: general.secondLastname,

            apellidoAdicional: "",

            primerNombre: general.name,

            segundoNombre: general.segundoNombre ? general.segundoNombre : "",

            fechaNacimiento: "",

            rfc: rfc ? rfc : general.rfcPerson,

            prefijo: "",

            sufijo: "",

            nacionalidad: "MX",

            residencia: "",

            numeroLicenciaConducir: "",

            estadoCivil: "",

            sexo: "",

            numeroCedulaProfesional: "",

            numeroRegistroElectoral: "",

            claveImpuestosOtroPais: "",

            claveOtroPais: "",

            numeroDependientes: "",

            edadesDependientes: "",

            fechaRecepcionInformacionDependientes: "",
          },
        },
      },
    });
    const token = await getToken("RPF");
    return {
      url: url,
      data: data,
      token: token,
    };
  },
  async dataBuroProspector({ general, referenciaOperador, rfc }) {
    const url =
      "https://api.burodecredito.com.mx:4431/pf/prospector/credit-report-api/v1/prospector";
    const data = JSON.stringify({
      consulta: {
        persona: {
          autentica: {
            ejercidoCreditoAutomotriz: general.carCredit !== "NO" ? "V" : "F",
            ejercidoCreditoHipotecario: general.mortgageCredit ? "V" : "F",
            referenciaOperador: referenciaOperador,
            tarjetaCredito: general.creditCard ? "V" : "F",
            tipoReporte: "RCN",
            tipoSalidaAU: 4,
            ultimosCuatroDigitos: general.creditCard ? general.last4 : "",
          },
          cuentaC: [
            {
              claveOtorgante: "",
              nombreOtorgante: "",
              numeroCuenta: "",
            },
          ],
          domicilios: [
            {
              ciudad: "",
              codPais: "MX",
              coloniaPoblacion: removeAccents(general.address.town),
              cp: general.address.zipCode,
              delegacionMunicipio: removeAccents(general.address.municipality),
              direccion1: removeAccents(
                `${general.address.street} ${
                  general.address.extNumber
                    ? `N${general.address.extNumber}`
                    : ""
                }`
              ),
              direccion2: general.address.intNumber
                ? `INT ${general.address.intNumber}`
                : "",
              estado: codigoEstado(general.address.state),
              extension: "",
              fax: "",
              fechaResidencia: "",
              indicadorEspecialDomicilio: "",
              numeroTelefono: "",
              tipoDomicilio: "",
            },
          ],
          empleos: [
            {
              baseSalarial: "",
              cargo: "",
              ciudad: "",
              claveMonedaSalario: "",
              codPais: "",
              coloniaPoblacion: "",
              cp: "",
              delegacionMunicipio: "",
              direccion1: "",
              direccion2: "",
              estado: "",
              extension: "",
              fax: "",
              fechaContratacion: "",
              fechaUltimoDiaEmpleo: "",
              nombreEmpresa: "",
              numeroEmpleado: "",
              numeroTelefono: "",
              salario: "",
            },
          ],
          encabezado: {
            clavePais: "MX",
            claveUnidadMonetaria: " ",
            identificadorBuro: "",
            idioma: "SP",
            importeContrato: "",
            numeroReferenciaOperador: referenciaOperador,
            productoRequerido: "107",
            tipoConsulta: "I",
            tipoContrato: "CL",
          },
          nombre: {
            apellidoPaterno: removeAccents(general.lastname),
            apellidoMaterno: removeAccents(general.secondLastname),
            apellidoAdicional: "",
            primerNombre: removeAccents(general.name),
            segundoNombre: general.segundoNombre
              ? removeAccents(general.segundoNombre)
              : "",
            fechaNacimiento: "",
            rfc: rfc ? rfc : general.rfcPerson,
            prefijo: "",
            sufijo: "",
            nacionalidad: "MX",
            residencia: "",
            numeroLicenciaConducir: "",
            estadoCivil: "",
            sexo: "",
            numeroCedulaProfesional: "",
            numeroRegistroElectoral: "",
            claveImpuestosOtroPais: "",
            claveOtroPais: "",
            numeroDependientes: "",
            edadesDependientes: "",
            fechaRecepcionInformacionDependientes: "",
          },
        },
      },
    });
    const token = await getToken("PPF");
    return {
      url: url,
      data: data,
      token: token,
    };
  },
  async dataBuroMoral({ general, firma }) {
    const url =
      "https://api.burodecredito.com.mx:4431/pm/reporte-de-credito/pm-report/api/v1/reporte-de-credito";
    const data = JSON.stringify({
      ambiguedad: "N",
      claveDeConsolidacion: "",
      codigoScore: "",
      firmaDeAutorizacionDelCliente: general.firma ? "S" : "N",
      indicadorScore: "N",
      indicadorVariablesCalifica: "N",
      persona: {
        apellidoAdicional: "",
        apellidoMaterno: "",
        apellidoPaterno: "",
        curp: "",
        domicilio: {
          alcaldiaOMunicipio: removeAccents(general.address.municipality),
          ciudad: removeAccents(general.address.municipality),
          codigoPostal: general.address.zipCode,
          coloniaOPoblacion: removeAccents(general.address.town),
          direccion: removeAccents(
            `${general.address.street} ${
              general.address.extNumber ? `N${general.address.extNumber}` : ""
            }`
          ),
          estado: codigoEstado(general.address.state),
          paisDeOrigenDelDomicilio: "MX",
          segundaDireccion: "",
        },
        fechaDeNacimiento: "",
        nacionalidad: "",
        nombre: "",
        razonSocial: general.businessName,
        rfc: general.rfc,
        segundoNombre: "",
        tipoCliente: "1",
      },
      referenciaCrediticia: "",
    });
    const token = await getToken("RPM");
    return {
      url: url,
      data: data,
      token: token,
    };
  },
  async resBuro(
    Resburo,
    referenciaOperador,
    buro,
    hubspotDealId,
    client,
    type,
    buroId,
    scoreProspector,
    moral,
    user
  ) {
    let scoreValue = Resburo.respuesta.persona.scoreBuroCredito
      ? Resburo.respuesta.persona.scoreBuroCredito[0].valorScore
      : scoreProspector
      ? scoreProspector
      : "ERROR";

    let data = {
      folio: referenciaOperador,
      referencia: Resburo.respuesta.persona.encabezado.numeroControlConsulta,
      tipo: type,
      fecha: new Date(),
      status: "success",
      resultado: Resburo,
      scoreValue: scoreValue,
    };

    let dataBuro = await Buro.findById(buroId);
    let nuevaConsulta = await Consultas.create(data);
    await Buro.findByIdAndUpdate(buro._id, {
      consultas: [...dataBuro.consultas, { _id: nuevaConsulta._id }],
    });

    let paramsHub = {
      score: scoreValue,
      status: "SUCCESS",
      idConsulta: "INTERNO",
    };

    let buroHub = await hubspotController.deal.update(
      hubspotDealId,
      "buro",
      paramsHub
    );

    if(moral){
    await hubspotController.deal.update(
      user.hubspotDealId,
      "single_field",
      {
        value: "SUCCESS",
        name: "respuesta_unykoo_2_buro_moral_",
      }
    );
    }

    // console.log("buroHub", buroHub);

    await Client.findByIdAndUpdate(client._id, {
      score: scoreValue,
    });
  },
};

module.exports = dataBuro;
