const User = require("../models/User");
const ComercialInfo = require("../models/ComercialInfo");
const GeneralInfo = require("../models/GeneralInfo");
const Appliance = require("../models/Appliance");
const Buro = require("../models/BuroM");
const hubspotController = require("../controllers/hubspotController");
const axios = require("axios");
const userController = require("../controllers/userController");
const Client = require("../models/Client");
const format = require("../services/formatManager");
const dataBuro = require("../services/dataBuro");
const Consultas = require("../models/Consultas");
const Amount = require("../models/Amount");
const { response } = require("express");
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
    // si se consulta el buro de un usuario en hubspot se actuliza en la base de datos el buro y regreso la calificacion de la persona
    let pruebaScore = await hubspotController.deal.getScore(hubspotDealId);
    if (!isNaN(pruebaScore)) {
      await Client.findByIdAndUpdate(user.idClient._id, {
        score: pruebaScore,
      });

      let userUpdateHub = await User.findById(req.params.id);
      return res.status(200).json({
        success: true,
        buro: {
          valorScore: pruebaScore,
          status: "success",
        },
        user: userUpdateHub,
      });
    }

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
        rfc,
        update,
      } = req.body;

      let rfcConsulta = "";
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
          if (rfc) {
            await ComercialInfo.findByIdAndUpdate(
              user.idClient.idComercialInfo,
              {
                rfc: rfc,
              }
            );
            await hubspotController.deal.update(
              user.hubspotDealId,
              "single_field",
              {
                value: rfc,
                name: "n3_rfc",
              }
            );
          }
          let generalInfo = await GeneralInfo.findById(generalKey);

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
              curp: generalInfo.curp,
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

          /*descomentar solo para pruebas*/
          // let userUpdatePrueba = await User.findById(req.params.id);
          // return res.status(400).json({
          //   success: true,
          //   message: "prueba",
          //   buro: {
          //     nombreScore: "Prueba",
          //     valorScore: 425,
          //     status: "SUCCESS",
          //     rfc: rfc,
          //     rfcPerson: rfcPerson
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

      person =
        user.idClient.type === "PM"
          ? "P.Moral"
          : user.idClient.type === "PF"
          ? "PF"
          : "PFAE";

      if (person === "P.Moral") {
        rfcConsulta = rfcPerson;
        comercialRFC = comercial.rfc;
        razonSocial = comercial.businessName;
        calleComercial =
          comercial.address.street + " " + comercial.address.extNumber;
        zipCodeComercial = comercial.address.zipCode;
      } else {
        rfcConsulta = comercial.rfc;
      }

      const { street, zipCode } = address;

      //para pruebas en local
      // if (process.env.NODE_ENV === "localhost") {
      //   return res.status(400).json({
      //     success: true,
      //     message: "prueba",
      //     buro: {
      //       nombreScore: "Prueba",
      //       valorScore: 750,
      //       status: "SUCCESS",
      //     },
      //     user: user,
      //   });
      // }
      const response = await axios(configLogin);

      const { data } = response;

      if (data.success === true) {
        //Si el login fue exitoso

        let { idUnykoo, nextComponentName } = data.data;
        let params = null;

        if (process.env.NODE_ENV !== "localhost") {
          params = JSON.stringify({
            login: "PROSPECTOR",
            idUnykoo: idUnykoo,
            formName: nextComponentName,
            data: {
              7: "0002",
              8: person,
              9: "10000000",
              10: "3 años",
              11: "40",
              12: zipCode,
              14: name,
              15: lastname,
              16: secondLastname,
              17: rfcConsulta,
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

          let tarjeta = "";
          let hipotecario = "";
          creditCard === true
            ? (tarjeta = "V")
            : creditCard === "1"
            ? (tarjeta = "V")
            : (tarjeta = "F");
          mortgageCredit === true
            ? (hipotecario = "V")
            : mortgageCredit === "1"
            ? (hipotecario = "V")
            : (hipotecario = "F");

          let carro = carCredit === "YES" ? "V" : "F";
          let last4N = last4 !== null ? last4 : "";

          let idForm = resForm.data.data.idUnykoo;

          if (process.env.NODE_ENV !== "localhost") {
            datos = JSON.stringify({
              login: "PROSPECTOR",
              idUnykoo: idForm,
              profileName: "Prospector",
              data: {
                6: rfcConsulta,
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
                276: last4N,
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
                269: "F",
                271: "F",
                273: "V",
                276: "9919",
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

      if (errorCode === 8) {
        let paramsHub = {
          score: "",
          status: "ERROR_AUTENTICACION",
          idConsulta: error.response.data.data.idUnykoo,
        };
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
          error: error,
        });
      } else if (errorCode !== 500) {
        console.log(errorCode, "error de worfloo");
        console.log(code);
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
  async update(req, res) {
    let id = req.params.id;
    let user = await User.findById(id); //busca el usuario por id
    let comercialId = user.idClient.idComercialInfo; //obtiene el id del comercial
    let hubspotDealId = user.hubspotDealId;
    let comercial = await ComercialInfo.findById(comercialId); //busca el comercial por id
    let warranty = comercial.warranty; //obtiene el valor de la garantia

    switch (warranty) {
      case 1:
        warranty = warranty;
        break;
      case 2:
        warranty = 3;
        break;
      case 3:
        warranty = warranty;
        break;
      case 4:
        warranty = 1;
        break;
      default:
        warranty = 1;
        break;
    }

    try {
      let params = {
        value: format.WARRANTY[warranty],
        name: "n3_14_garant_a",
      };
      let update = await hubspotController.deal.update(
        hubspotDealId,
        "single_field",
        params
      );
      if (update) {
        await ComercialInfo.findByIdAndUpdate(user.idClient.idComercialInfo, {
          warranty: warranty,
        });
        let userUpdate = await User.findById(req.params.id);
        return res.status(200).json({
          success: true,
          message: "Se actualizo correctamente",
          user: userUpdate,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar",
          user: user,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar",
        user: user,
        error: error,
      });
    }
  },
  async consulta({ id, type, scoreProspector }) {
    console.log(id, type);

    let user = await User.findById(id);
    let appliance = Appliance.findById(user.idClient.appliance[0]._id);
    let generalKey = user.idClient.idGeneralInfo;
    let comercialKey = user.idClient.idComercialInfo;
    let general = await GeneralInfo.findById(generalKey);
    let client = await Client.findById(user.idClient._id);
    let hubspotDealId = user.hubspotDealId;
    let comercial = await ComercialInfo.findById(comercialKey);

    let rfc = null;
    let control = null;
    let buro = null;
    let referenciaOperador = null;

    console.log(user.idClient.type);

    if (user.idClient.type !== "PM") {
      let comercial = await ComercialInfo.findById(
        user.idClient.idComercialInfo
      );
      rfc = comercial.rfc;
    }

    if (user.idClient.appliance[0].idBuro) {
      let data = await Buro.findById(user.idClient.appliance[0].idBuro._id);
      if (data) {
        buro = data;
        let consultas = data.consultas;
        console.log(consultas);
      }
      if(data.status){
        return {
          success: true,
          message: "Consulta buro: " + type,
          user : user,
          score: user.idClient.score,
        }
      }
    } else {
      let buroCreate = await Buro.create({
        status: false,
      });

      await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
        idBuro: {
          _id: buroCreate._id,
        },
      });

      buro = buroCreate;
    }

    let ultimaConsulta = await userController.ultimaConsulta();

    if (ultimaConsulta) {
      referenciaOperador = ultimaConsulta.folio + 1;
    } else {
      referenciaOperador = 0000000000000000000000005;
    }

    let databuro = null;

    // if(process.env.NODE_ENV !== "production"){
    //   return res.status(200).json({
    //     success: true,
    //     message: "Consulta buro: " + type,
    //     token: token,
    //     url: url,
    //     data: data,
    //   });
    // }

    switch (type) {
      case "prospector":
        databuro = await dataBuro.dataBuroProspector({
          general,
          referenciaOperador,
          rfc,
        });
        break;
      case "buro":
        databuro = await dataBuro.dataBuroReporte({
          general,
          referenciaOperador,
          rfc,
        });
        break;
      case "moral":
        databuro = await dataBuro.dataBuroMoral({
          general: comercial,
          control,
        });
        break;
      default:
        databuro = await dataBuro.dataBuroProspector({
          general,
          referenciaOperador,
          rfc,
        });
        break;
    }

    let { token, url, data } = databuro;

    if (!token.success) {
      return {
        success: false,
        error: "token",
        message: "Error al generar token",
        token: token,
      };
    }

    // if(process.env.NODE_ENV !== "production"){
    //   return {
    //     success: true,
    //     message: "Consulta buro: " + type,
    //     token: token,
    //     url: url,
    //     data: data,
    //     user: user,
    //   };
    // }

    let config = {};

    let AuthConfig = {
      method: "post",
      url: url,
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    let Moralconfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        Accept: "application/vnd.com.bc.pm.report.api-v1+json",
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    if (type === "moral") {
      config = Moralconfig;
    } else {
      config = AuthConfig;
    }

    // console.log("config buro :", config);

    console.log("consulta buro :", user.name);

    // if(process.env.NODE_ENV !== "production"){
    //   return res.status(200).json({
    //   success: true,
    //   message: "Consulta buro",
    // });
    // }

    let res = await axios(config)
      .then(async (response) => {
        let Resburo = response.data;

        if (Resburo.respuesta === undefined && type !== "moral") {
          console.log("error buro");
          let data = {
            folio: referenciaOperador,
            tipo: type,
            fecha: new Date(),
            status: "error",
            error: Resburo,
          };

          let nuevaConsulta = await Consultas.create(data);
          await Buro.findByIdAndUpdate(buro._id, {
            consultas: {
              _id: nuevaConsulta._id,
            },
          });

          let score = client.score;

          switch (score) {
            case null:
            case undefined:
            case "":
            case "ERROR 3":
              score = "ERROR";
              break;
            case "ERROR":
              score = "ERROR 1";
              break;
            case "ERROR 1":
              score = "ERROR 2";
              break;
            case "ERROR 2":
              score = "ERROR 3";
              break;
            default:
              score = "ERROR";
              break;
          }

          let paramsHub = {
            score: "",
            status: "ERROR",
            idConsulta: nuevaConsulta._id,
          };

          let buroHub = await hubspotController.deal.update(
            hubspotDealId,
            "buro",
            paramsHub
          );

          let clientUpdate = await Client.findByIdAndUpdate(client._id, {
            score: score,
          });

          let userUpdate = await User.findById(id);

          return {
            success: false,
            error: "datos",
            consulta: nuevaConsulta,
            message: "Error al consultar datos",
            user: userUpdate,
          };
        }

        if (
          Resburo.respuesta !== undefined &&
          Resburo.respuesta.persona.error !== undefined &&
          Resburo.respuesta.persona.error !== null &&
          type !== "moral"
        ) {
          console.log("error buro", Resburo.respuesta.persona.error);
          let data = {
            folio: referenciaOperador,
            tipo: type,
            fecha: new Date(),
            status: "error",
            error: Resburo.respuesta.persona.error,
          };

          let nuevaConsulta = await Consultas.create(data);

          await Buro.findByIdAndUpdate(buro._id, {
            consultas: {
              _id: nuevaConsulta._id,
            },
          });

          let score = client.score;

          switch (score) {
            case null:
            case undefined:
            case "":
            case "ERROR 3":
              score = "ERROR";
              break;
            case "ERROR":
              score = "ERROR 1";
              break;
            case "ERROR 1":
              score = "ERROR 2";
              break;
            case "ERROR 2":
              score = "ERROR 3";
              break;
            default:
              score = "ERROR";
              break;
          }

          let paramsHub = {
            score: "",
            status: "ERROR",
            idConsulta: nuevaConsulta._id,
          };

          let buroHub = await hubspotController.deal.update(
            hubspotDealId,
            "buro",
            paramsHub
          );

          let clientUpdate = await Client.findByIdAndUpdate(client._id, {
            score: score,
          });

          let userUpdate = await User.findById(id);

          return {
            success: false,
            error: "datos",
            message: "Error al consultar datos",
            consulta: nuevaConsulta,
            user: userUpdate,
          };
        }

        if (type === "moral") {
          let data = {
            folio: referenciaOperador,
            tipo: type,
            referencia: Resburo.encabezado
              ? Resburo.encabezado.identificadorTransaccion
              : "ERROR",
            fecha: new Date(),
            status: "success",
            resultado: Resburo,
          };

          await ComercialInfo.findByIdAndUpdate(comercialKey, {
            buroMoral: true,
          });

          let nuevaConsulta = await Consultas.create(data);
          await Buro.findByIdAndUpdate(buro._id, {
            moralStatus: true,
            consultas: {
              _id: nuevaConsulta._id,
            },
          });

          let userUpdate = await User.findById(id);

          return {
            success: true,
            message: "Consulta buro: " + type,
            user: userUpdate,
          };
        }

        let scoreValue = Resburo.respuesta.persona.scoreBuroCredito
          ? Resburo.respuesta.persona.scoreBuroCredito[0].valorScore
          : scoreProspector
          ? scoreProspector
          : "ERROR";

        await dataBuro.resBuro(
          Resburo,
          referenciaOperador,
          buro,
          hubspotDealId,
          client,
          type,
          scoreProspector
        );

        let userUpdate = await User.findById(id);

        return {
          success: true,
          message: "Consulta buro: " + type,
          score: scoreValue,
          user: userUpdate,
        };
      })
      .catch(async (error) => {
        console.log(error);
        console.log(`error al obtener el AuthBuro ${error}`);
        let userUpdate = await User.findById(id);
        return {
          success: false,
          message: "Error al actualizar",
          error: error,
          user: userUpdate,
        };
      });

    return res;
  },
  async buroLogic(req, res) {
    let { id } = req.body;
    if (req.body.update) {
      let user = await User.findById(id);
      let appliance = Appliance.findById(user.idClient.appliance[0]._id);
      let generalKey = user.idClient.idGeneralInfo;
      let comercialKey = user.idClient.idComercialInfo;

      await getUpdate(GeneralInfo, generalKey, req.body);
      await getUpdate(ComercialInfo, comercialKey, req.body);
    }
    // return res.status(500).json({
    //   success: true,
    // });
    try {
      let prospector = await buroController.consulta({
        id,
        type: "prospector",
      });

      if (!prospector.success) {
        return res.status(412).json({
          ...prospector,
        });
      }

      if (prospector.score === "ERROR") {
        return res.status(412).json({
          ...prospector,
        });
      }

      let scoreProspector = prospector.score;

      if (scoreProspector >= 525) {
        let buro = await buroController.consulta({
          id,
          type: "buro",
          scoreProspector,
        });

        return res.status(200).json({
          ...buro,
        });
      } else {
        return res.status(200).json({
          ...prospector,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar",
        error: error,
      });
    }
  },
  async buroLogicMoral(req, res) {
    let { id, idAmount } = req.body;
    let user = await User.findById(id);
    let comercialKey = user.idClient.idComercialInfo;
    let appliance = Appliance.findById(user.idClient.appliance[0]._id);

    if(user.idClient.score === undefined || user.idClient.score === null || user.idClient.score === "") {
      return res.status(200).json({
        success: true,
        message: "El cliente no tiene score",
        user : user
      });
    }

    if(user.idClient.score < 524) {
      return res.status(200).json({
        success: true,
        message: "El cliente no tiene el score suficiente para consultar el buro moral",
        user : user
      });
    }


    if (user.idClient.appliance[0].idBuro) {
      let buro = await Buro.findById(user.idClient.appliance[0].idBuro._id);
      let data = await Buro.findById(buro._id);

      if (data) {
        let consultas = data.consultas;
      }

      if(data.moralStatus) {
        return res.status(200).json({
          success: true,
          message: "Ya se ha consultado el buro moral",
          consulta: data.consultas,
          user : user
        });
      }
    } else {
      let buro = await Buro.create({
        moralStatus: false,
      });
      // await Appliance.findByIdAndUpdate(appliance._id, {
      //   idBuro: {
      //     _id: buro._id,
      //   }
      // });
      await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
        idBuro : {
            _id : buro._id
        }
    });
    }

    let comercialInfo = await ComercialInfo.findById(comercialKey);

    if(comercialInfo.firma === true){
      let moral = await buroController.consulta({ id, type: "moral" });

        if (moral.success) {
          return res.status(200).json({
            ...moral,
          });
        } else {
          return res.status(412).json({
            ...moral,
          });
        }
      }

    if (comercialInfo.firma === false && comercialInfo.consulta === 0) {
      if (idAmount.yearSales >= 10000000 && (idAmount.old === "THREE" || idAmount.old === "PFOUR")) {
        await ComercialInfo.findByIdAndUpdate(comercialKey, {
          consulta: 1,
        });
        let moral = await buroController.consulta({ id, type: "moral" });

        if (moral.success) {
          return res.status(200).json({
            ...moral,
          });
        } else {
          return res.status(412).json({
            ...moral,
          });
        }
      }

    }

    return res.status(200).json({
      success: false,
      message: "No se puede realizar la consulta se neceita firma o ventas mayores a 10 millones",
      user: user,
    });
  },
  async updateMoral(req, res) {
    let { email, firma  } = req.body;

    if(firma === "true" ) {
      firma = true;
    } else {
      firma = false;
    }

    let user = await User.findOne({ email });

    if(user) {
      let comercialKey = user.idClient.idComercialInfo;
      let comercialInfo = await ComercialInfo.findById(comercialKey);

      if(comercialInfo.firma === false && firma === true) {
        await ComercialInfo.findByIdAndUpdate(comercialKey, {
          firma: firma,
        });
        return res.status(200).json({
          success: true,
          message: "Se actualizo la firma a " + firma, 
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "No se puede actualizar la firma",
        });
      }
      
    } else {
      return res.status(200).json({
        success: false,
        message: "No se encontro el usuario",
      });
      console.log("No se encontro el usuario");
    }
  },
  async getConsultas (req, res) {
    let email = req.body.email;
    let token = req.headers["token"];

    if (token != 'D7Mqvg5aPcypn97dxdB/Kfe330wwu0IXx0pFQXIFmjs=') {
      return res.status(403).send("A token is required for authentication");
    }

    let user = await User.findOne({ email });

    if(user) {
      let appliance = await Appliance.findById(user.idClient.appliance[0]._id);
      let buro = await Buro.findById(appliance.idBuro._id);

      let comercialKey = user.idClient.idComercialInfo;
      let generalKey = user.idClient.idGeneralInfo;
      let comercialInfo = await ComercialInfo.findById(comercialKey);
      let generalInfo = await GeneralInfo.findById(generalKey);

      let rfc = comercialInfo.rfc;
      let rfcPerson = generalInfo.rfcPerson ? generalInfo.rfcPerson : comercialInfo.rfc;

      return res.status(200).json({
        success: true,
        message: "Consultas",
        consultas: buro.consultas,
        rfc: rfc,
        rfcPerson: rfcPerson,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No se encontro el usuario",
      });
      console.log("No se encontro el usuario");
    }
  }
};

module.exports = buroController;
