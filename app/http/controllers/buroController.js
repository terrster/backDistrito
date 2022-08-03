const path = require("path");
const User = require("../models/User");
const ComercialInfo = require("../models/ComercialInfo");
const GeneralInfo = require("../models/GeneralInfo");
const hubspotController = require("../controllers/hubspotController");
const axios = require("axios");
const Client = require("../models/Client");
const { response } = require("express");
const rateLimit = require("express-rate-limit");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const HAPIKEY_UNYKOO = process.env.HAPIKEY_UNYKOO;
const UNYKOO_URL = process.env.UNYKOO_URL;


const headers = {
  "Content-Type": "application/json",
  api_key: HAPIKEY_UNYKOO,
  company_code: "P2VXMnh",
};



const buroController = {
  async inicio(req, res) {

    const data = JSON.stringify({
      login: "PROSPECTOR",
      workflowName: "DP",
    });

    const configLogin = {
      method: "POST",
      url: `${UNYKOO_URL}/workfloo`,
      headers: headers,
      data: data,
    };
    let user = await User.findById(req.params.id);
    let hubspotDealId = user.hubspotDealId;

    try {
      let {
        name,
        lastname,
        secondLastname,
        address,
        carCredit,
        creditCard,
        mortgageCredit,
        last4,
        rfcPerson,
        update,
      } = req.body;
      
      let rfc = "";
      let comercialRFC = "";
      let razonSocial = "";
      let calleComercial = "";
      let zipCodeComercial = "";
      let person = "";

      if (update) {
        try {
          let generalKey = user.idClient.idGeneralInfo;

          await GeneralInfo.findByIdAndUpdate(generalKey, {
            name: name,
            lastname: lastname,
            secondLastname: secondLastname,
            carCredit: carCredit,
            creditCard: creditCard,
            mortgageCredit: mortgageCredit,
            last4: last4,
            rfcPerson: rfcPerson,
          });
          let generalInfo = await GeneralInfo.findById(generalKey);


          /*descomentar solo para pruebas*/
          // let userUpdatePrueba = await User.findById(req.params.id);
          let dealUpdated = await hubspotController.deal.update(
            user.hubspotDealId,
            "generalBuro",
            {
              name, //info general
              lastname,
              secondLastname,
              rfcPerson,
              mortgageCredit,
              carCredit,
              creditCard,
              last4,
            }
          );
          if (dealUpdated.error) {
            return res.status(400).json({
              success: false,
              message: "ERROR AL ACTUALIZAR EL DEAL EN HUBSPOT",
              user: user,
            });
          }
          // documentar para usar en local
          // return res.status(400).json({
          //   success: true,
          //   message: "prueba",
          //   buro: {
          //     nombreScore: "Prueba",
          //     valorScore: 425,
          //     status: "SUCCESS",
          //   },
          //   user: userUpdatePrueba,
          // });
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Error Hubspot" + e,
            user: user,
          });
        }
      }

      let comercial = await ComercialInfo.findById(
        user.idClient.idComercialInfo
      );

      person = user.idClient.type === "PM" ? "PM" : "PF";

      if (person === "PM") {
        rfc = rfcPerson;
        comercialRFC = comercial.rfc;
        razonSocial = comercial.businessName;
        calleComercial =
          comercial.address.street + " " + comercial.address.extNumber;
        zipCodeComercial = comercial.address.zipCode;
      } else {
        rfc = comercial.rfc;
      }

      const { street, zipCode } = address;

            //descomentar para pruebas en local
      if (process.env.NODE_ENV === "localhost") {
        return res.status(400).json({
          success: true,
          message: "prueba",
          buro: {
            nombreScore: "Prueba",
            valorScore: 450,
            status: "SUCCESS",
          },
          user: user,
        });
      }
      const response = await axios(configLogin);

      const { data } = response;

      if (data.success === true) {
        //Si el login fue exitoso

        let { idUnykoo, nextComponentName } = data.data;
        let params = null;

        if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
          params = JSON.stringify({
            login: "PROSPECTOR",
            idUnykoo: idUnykoo,
            formName: nextComponentName,
            data: {
              7: "0002",
              8: "PF",
              9: "10000000",
              10: "3 años",
              11: "40",
              12: zipCode,
              14: name,
              15: lastname,
              16: secondLastname,
              17: rfc,
              18: street,
              19: "50000",
              20: "48",
              22: "Si",
              23: "No",
              25: comercialRFC,
              26: razonSocial,
              28: calleComercial,
              29: zipCodeComercial,
              172: "BURO",
            },
          });
        } else {
          params = JSON.stringify({
            login: "PROSPECTOR",
            idUnykoo: idUnykoo,
            formName: nextComponentName,
            data: {
              7: "0002",
              8: "PF",
              9: "10000000",
              10: "3 años",
              11: "40",
              12: "55070",
              14: "jonathan",
              15: "villegas",
              16: "sanchez",
              17: "VISJ940102FY3",
              18: "Rio nilo n 74",
              19: "50000",
              20: "48",
              22: "Si",
              23: "No",
              25: "",
              26: "",
              28: "",
              29: "",
              172: "BURO",
            },
          });
        }

        const configForm = {
          method: "POST",
          url: `${UNYKOO_URL}/form`,
          headers: headers,
          data: params,
        };

        const resForm = await axios(configForm);
        if (resForm.data.success === true) {
          //Si el formulario se envio correctamente

          let datos = null;

          let tarjeta = creditCard ? "V" : "F";
          let hipotecario = mortgageCredit ? "V" : "F";
          let carro = carCredit === "YES" ? "V" : "F";

          let idForm = resForm.data.data.idUnykoo;

          if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
            datos = JSON.stringify({
              login: "PROSPECTOR",
              idUnykoo: idForm,
              profileName: "Prospector",
              data: {
                6: rfc,
                22: "107",
                27: "I",
                28: "CL",
                30: "50000",
                3: name,
                64: lastname,
                1: secondLastname,
                33: street,
                39: zipCode,
                716: "MX",
                269: carro,
                271: hipotecario,
                273: tarjeta,
                276: last4,
                tipo_autenticacion: "AUTENTICACION",
              },
            });
          } else {
            datos = JSON.stringify({
              login: "PROSPECTOR",
              idUnykoo: idForm,
              profileName: "Prospector",
              data: {
                6: "VISJ940102FY3",
                22: "107",
                27: "I",
                28: "CL",
                30: "50000",
                3: "jonathan",
                64: "villegas",
                1: "sanchez",
                33: "Rio nilo n 74",
                39: "55070",
                716: "MX",
                269: "V",
                271: "V",
                273: "V",
                276: "1234",
                tipo_autenticacion: "AUTENTICACION",
              },
            });
          }
          const configConsulta = {
            method: "POST",
            url: `${UNYKOO_URL}/consulta`,
            headers: headers,
            data: datos,
          };

          const resConsulta = await axios(configConsulta);

          if (resConsulta.data.success === true) {
            let idConsulta = resConsulta.data.data.idUnykoo;
            const confiGet = {
              method: "GET",
              url: `${UNYKOO_URL}/workfloo/${idConsulta}`,
              headers: headers,
            };
            const getConsulta = await axios(confiGet);
            const dataConsulta = getConsulta.data.data[3];

            let { consultaSIC, status } = dataConsulta;
            let { scoreBuroCredito } = consultaSIC.respuestaBC;
            let { nombreScore, valorScore } = scoreBuroCredito[0];

            let paramsHub = {
              score: valorScore,
              status: status,
              idConsulta: idConsulta,
            };

            let buroHub = await hubspotController.deal.update(
              hubspotDealId,
              "buro",
              paramsHub
            );
            await Client.findByIdAndUpdate(user.idClient._id, {
              score: valorScore,
            });

            let userUpdate = await User.findById(req.params.id);

            if (buroHub) {
              return res.status(200).json({
                success: true,
                buro: {
                  nombreScore,
                  valorScore,
                  status,
                },
                user: userUpdate,
              });
            } else {
              return res.status(200).json({
                success: false,
                message: "Hubspot no respondio",
                buro: {
                  nombreScore,
                  valorScore,
                  status,
                },
                user: userUpdate,
              });
            }
          }
        } else {
          return res.status(500).json({
            success: false,
            message: "Error al enviar el formulario",
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          message: "Error al logearse en unykoo",
        });
      }
    } catch (error) {

      let response = "response" in error ? error.response : 500;
      if (response === 500) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error en el servidor",
          user: user,
          error: error,
        });
      }
      let code = "data" in response ? error.response.data : 500;
      if (code === 500) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error en el server",
          user: user,
          error: response,
        });
      }
      let errorCode = "errorCode" in code ? code.errorCode : 500;

      if (errorCode === 8){
        let paramsHub = {
          score: "",
          status: "ERROR_AUTENTICACION",
          idConsulta: error.response.data.data.idUnykoo,
        };
        let buroHub = await hubspotController.deal.update(
          hubspotDealId,
          "buro",
          paramsHub
        );
        const clienteError = await Client.findById(user.idClient._id);
            const { score } = clienteError;
            let scoreError = "";
            let statusCode = 400;
            switch (score) {
              case null || undefined:
                scoreError = "ERROR";
                break;
              case "":
                scoreError = "ERROR";
                break;
              case "ERROR":
                scoreError = "ERROR 1";
                break;
              case "ERROR 1":
                scoreError = "ERROR 2";
                break;
              case "ERROR 2":
                scoreError = "ERROR 3";
                break;
              case "ERROR 3":
                scoreError = "ERROR 3";
                statusCode = 401;
                break;
              default:
                scoreError = score;
                break;
            }
            await Client.findByIdAndUpdate(user.idClient._id, {
              score: scoreError,
            });

            let userUpdate = await User.findById(req.params.id);

            return res.status(statusCode).json({
              success: false,
              message: "Error Autenticación",
              user: userUpdate,
            });

      } else if (errorCode !== 500) {
        console.log(errorCode, "error de worfloo")
        return res.status(400).json({
          success: false,
          message: "Error en el server",
          user: user,
          error: code,
        });
      }

      console.log(error, "Error interno no controlado");
      return res.status(500).json({
        code: 500,
        msg: "Error al Iniciar el workflow",
        error: error,
        user: user,
      });
    }
  },
  async limit(req, res) {
    let limit  = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 3, // limit each IP to 100 requests per windowMs
      message: "Too many accounts created from this IP, please try again after an hour",
    });
    return limit(req, res, () => {
      return res.status(200).json({
        success: true,
        message: "Limit",
      });
    }
    );

  },
};
module.exports = buroController;
