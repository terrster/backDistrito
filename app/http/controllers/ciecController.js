"use strict";

const hubspotController = require("../controllers/hubspotController");
const ComercialInfo = require("../models/ComercialInfo");
const User = require("../models/User");
const GeneralInfo = require("../models/GeneralInfo");
const Address = require("../models/Address");
const Appliance = require("../models/Appliance");
const Client = require("../models/Client");
const { google } = require("googleapis");
const Sheets = require("../controllers/sheetsController");
const  Control = require("../models/Control");

const _axios = require("axios").default;
const axios = _axios.create({
  baseURL: "https://2kwhn18zoh.execute-api.us-east-1.amazonaws.com/prod",
});
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

/*
    * @desc    validacion y guardado de la CIEC
    * @Author  Jonathan
    * @route   POST /ciec
    * @access  Public
    * @params  RFC, CIEC, ID
    * @return  json
    * @return  status
    * @return  message
    * @return  user
    * @return  error
*/

const rfcValido = (rfc, aceptarGenerico = true) => {
  let _rfc_pattern_pm =
    "^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
  let _rfc_pattern_pf =
    "^(([A-ZÑ&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
    "(([A-ZÑ&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
  let rfcTest = rfc.match(_rfc_pattern_pm) || rfc.match(_rfc_pattern_pf);
  if (rfcTest && rfc.length <= 13) {
    return true;
  } else {
    return false;
  }
};

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
const until = (cond, time) =>
  cond().then((result) => result || delay(time).then(() => until(cond, time)));

const getUpdate = async (Accion, id, params) => {
  return await until(
    () => {
      return Accion.findByIdAndUpdate(id, params).then((res) => {
        if (res) {
          return res;
        }
        return false;
      });
    },
    1000,
    10
  );
};
const getPro = async (Accion, id) => {
  return await until(
    () => {
      return Accion.findById(id).then((acc) => {
        if (acc) {
          return acc;
        }
        return false;
      });
    },
    1000,
    10
  );
};

// const ciecController = {
//   create: async (req, res) => {
//     let { rfc, ciec, newCiec, id } = req.body;

//     let controlCiec = await Control.findOne({ name: "ciec" });
//     let ciecActual = controlCiec.passwordBuro;

//     let comercialId = "";
//     let hubspotDealId = "";
//     let pMoral = false;

//     let validRFC = rfcValido(rfc);

//     if (!validRFC) {
//       return res.status(500).json({
//         msg: "El RFC no es válido",
//       });
//     }

//     if (!id) {
//       let comercial = await ComercialInfo.findOne({ rfc: { $eq: rfc } });
//       if (comercial) {
//         comercialId = comercial._id;
//       }
//       let generalInfo = await GeneralInfo.findOne({ rfcPerson: { $eq: rfc } });

//       if (!generalInfo && !comercial) {
//         await Sheets.start(rfc, ciec); // Crea el cliente en Google Sheets
//         return res.status(500).json({
//           msg: "no se encontró el cliente, favor de verificar el RFC",
//         });
//       }
//       let idClient = "";
//       let isClient = false;

//           if(comercial){
//             isClient = true;
//           } else if(generalInfo){
//             pMoral = true;
//             isClient = true;
//           } else {
//             isClient = false;
//           }

//           if (!isClient) {
//             return res.status(500).json({
//               msg: "no se encontró el cliente, favor de verificar el RFC",
//             });
//           }

//         if (comercial) {
//           let client = await Client.findOne({ idComercialInfo: { $eq: comercial._id } });
//           if(client){
//             idClient = client._id;
//           }
//         } else if (generalInfo) {
//           let client = await Client.findOne({ idGeneralInfo: { $eq: generalInfo._id } });
//           if(client){
//             idClient = client._id;
//           }
//         }

//       let user = await User.findOne({ idClient: { $eq: idClient } });

//       if (!user) {
//         return res.status(500).json({
//           msg: "no se encontró el cliente, favor de verificar el RFC",
//         });
//       }

//       let type = user.idClient.type;

//       if (type === "PM" && pMoral) {
//         return res.status(500).json({
//           msg: "el cliente es persona moral, porfavor ingrese el RFC de la persona moral",
//         });
//       }

//       if (comercialId === "") {
//         comercialId = user.idClient.idComercialInfo;
//       }
//       id = user._id;
//       hubspotDealId = user.hubspotDealId;
//     } else {
//       let user = await User.findById(id);
//       let comercial = ""
//       if (user.idClient.idComercialInfo === null || user.idClient.idComercialInfo === undefined) {
//         let comercialInfoStored = await ComercialInfo.create({
//           rfc,
//           ciec,
//           status: false,
//         });
//         await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
//           idComercialInfo: {
//             _id: comercialInfoStored._id,
//           },
//         });

//         await Client.findByIdAndUpdate(user.idClient._id, {
//           idComercialInfo: {
//             _id: comercialInfoStored._id,
//           },
//         });
//         comercialId = comercialInfoStored._id;
//       } else {
//         comercial = await ComercialInfo.findById(user.idClient.idComercialInfo._id);
//         comercialId = comercial._id;
//       }
//       hubspotDealId = user.hubspotDealId;
//     }

//     if (ciecActual === ciec) {
//       let n4_93_ciec = Buffer.from(ciec).toString("base64");
//       await hubspotController.deal.update(hubspotDealId, "single_field", {
//         name: "n4_93_ciec",
//         value: "INTERNO",
//       })
//       .catch((error) => {
//         console.log(error);
//         return res.status(500).json({
//           msg: "Algo salió mal tratando de actualizar el CIEC",
//           error: error,
//         });
//       });
//       await hubspotController.deal.update(hubspotDealId, "single_field", {
//         name: "datacode",
//         value: n4_93_ciec,
//       })
//       .catch((error) => {
//         console.log(error);
//         return res.status(500).json({
//           msg: "Algo salió mal tratando de actualizar el CIEC",
//           error: error,
//         });
//       });
//       await ComercialInfo.findByIdAndUpdate(comercialId, {
//         ciecstatus: true,
//       });
//       let user = await getPro(User, id);
//       console.log(user);
//       return res.status(200).json({
//         code: 200,
//         msg: "la CIEC se actualizó correctamente",
//         user,
//       });
//     }

//     let data = {
//       type: "ciec",
//       rfc: rfc,
//       password: ciec,
//       slug: "b39d75",
//     };
//     await ciecController.getStatus(
//       { data, id, comercialId, hubspotDealId, ciec },
//       res
//     );
//   },
//   getStatus: async (req, res) => {
//     let { data } = req;
//     const refreshInterval = 4000;
    
//     let response = await axios.post("/b39d75", data).then((res) => {
//       return res;
//     }).catch((err) => {
//       return false;
//     });

//     if (!response) {
//       return res.status(500).json({
//         msg: "Error al consultar el CIEC",
//       });
//     }
//     let satStatus = "";
//     const checkSatatus = setInterval(async () => {
//       try{
//       const sat = await axios.get(`/b39d75/${response.data.id}`);
//       const status = sat.data.status;
//       switch (status) {
//         case "pending":
//           break;
//         default:
//           req = { ...req, status: status };
//           await ciecController.updateStatus(req, res);
//           clearInterval(checkSatatus);
//           break;
//       }
//       } catch (error) {
//         if(error.response !== undefined){
//         console.log(error.response);
//         return res.status(500).json({
//           msg: "Error al consultar el CIEC",
//           error: error.response,
//         });
//         clearInterval(checkSatatus);
//       } else {
//         console.log(error);
//         return res.status(500).json({
//           msg: "Error al consultar el CIEC",
//           error: error,
//         });
//         clearInterval(checkSatatus);
//       }
//       }
//     }, refreshInterval);
//   },
//   updateStatus: async (req, res) => {
//     let { status, id, comercialId, hubspotDealId, ciec } = req;
//     if (status === "invalid") {
//       return res.status(404).json({
//         msg: "la contraseña CIEC es incorrecta",
//         code: 400,
//       });
//     }
//     let n4_93_ciec = Buffer.from(ciec).toString("base64");
//     await hubspotController.deal
//       .update(hubspotDealId, "single_field", {
//         name: "n4_93_ciec",
//         value: "valid",
//       })
//       .catch((error) => {
//         console.log(error);
//         return res.status(500).json({
//           msg: "Algo salió mal tratando de actualizar el CIEC",
//           error: error,
//         });
//       });
//     await hubspotController.deal
//       .update(hubspotDealId, "single_field", {
//         name: "datacode",
//         value: n4_93_ciec,
//       })
//       .catch((error) => {
//         console.log(error);
//         return res.status(500).json({
//           msg: "Algo salió mal tratando de actualizar el CIEC",
//           error: error,
//         });
//       });
//     await ComercialInfo.findByIdAndUpdate(comercialId, {
//       ciecstatus: true,
//     });

//     let user = await getPro(User, id);
//     return res.status(200).json({
//       code: 200,
//       msg: "la CIEC se actualizó correctamente",
//       user,
//     });
//   },
// };

const ciecController = {
  get: async (req, res) => {
    let { rfc, ciec, CiecStatus } = req.body;

    if (CiecStatus === true) {

    let controlCiec = await Control.findOne({ name: "ciec" });
    let ciecActual = controlCiec.passwordBuro;

    if (ciecActual === ciec) {
      return res.status(200).json({
        msg: "la CIEC es correcta",
        code: 200,
      });
    }

    let rfcValid = rfcValido(rfc);

    if (!rfcValid) {
      return res.status(400).json({
        msg: "El RFC no es válido",
        code: 400,
      });
    }

    let data = {
      type: "ciec",
      rfc: rfc,
      password: ciec,
      slug: "b39d75",
    };

    return res.status(200).json({
      msg: "la CIEC es correcta",
      code: 200,
    });
 
    } else {
      return res.status(200).json({
        msg: "la CIEC es incorrecta",
        code: 400,
      });
    } 
  },
};

module.exports = ciecController;
