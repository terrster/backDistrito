const User = require("../models/User");
const ComercialInfo = require("../models/ComercialInfo");
const GeneralInfo = require("../models/GeneralInfo");
const Appliance = require("../models/Appliance");
const Buro = require("../models/BuroM");
const hubspotController = require("./hubspotController");
const axios = require("axios");
const userController = require("./userController");
const Client = require("../models/Client");
const format = require("../services/formatManager");
const dataBuro = require("../services/dataBuro");
const Consultas = require("../models/Consultas");
const Control = require("../models/Control");

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

const buroHelper = {

  async buroLogic(req, res) {
    let { id } = req.body;
    if (req.body.update) {
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
      let user = await User.findById(id);
      let appliance = Appliance.findById(user.idClient.appliance[0]._id);
      let generalKey = user.idClient.idGeneralInfo;
      let comercialKey = user.idClient.idComercialInfo;

      await getUpdate(GeneralInfo, generalKey, req.body);
      await getUpdate(ComercialInfo, comercialKey, req.body);

      if (rfc) {
        await ComercialInfo.findByIdAndUpdate(user.idClient.idComercialInfo, {
          rfc: rfc,
        });
        await hubspotController.deal.update(
          user.hubspotDealId,
          "single_field",
          {
            value: rfc,
            name: "n3_rfc",
          }
        );
      }

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
        console.log(
          "ERROR AL ACTUALIZAR EL DEAL EN HUBSPOT" + dealUpdated.error
        );
        return res.status(400).json({
          success: false,
          message: "ERROR AL ACTUALIZAR EL DEAL EN HUBSPOT",
          user: user,
        });
      }
    }
    let unykoo = await Control.findOne({ name: "unykoo" });
    console.log(unykoo)
    if(unykoo.unykoo = true) {
      let userNew = await User.findById(id);
      return res.status(200).json({
        code: 0,
        message: "Buro Desactivado",
        user: userNew,
      })
    }
    try {

        let buro = await buroHelper.consulta({
          id,
          type: "buro",
        });

        if (!buro.success) {
          return res.status(412).json({
            ...buro,
          });
        }

        if (buro.score === "ERROR") {
          return res.status(412).json({
            ...buro,
          });
        }

        return res.status(200).json({
          ...buro,
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar",
        error: error,
      });
    }
  },
  async consulta({ id, type, scoreProspector }) {
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
    let buroId = null;
    let referenciaOperador = null;

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
        buroId = data._id;
      }

      if(data.consultas.length > 0){
        let consultas = data.consultas;
        for(let i = 0; i < consultas.length; i++){
          if(consultas[i].status === "success" && type === "buro"){
            let scoreValue = consultas[i].scoreValue;
            await Client.findByIdAndUpdate(client._id, {
              score: scoreValue,
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

            if(user.idClient.type === "PM"){
              await hubspotController.deal.update(
                user.hubspotDealId,
                "single_field",
                {
                  value: "SUCCESS",
                  name: "estatus_workflow_unykoo_2_buro_moral_",
                }
              );
              }
              let userUpdate = await User.findById(id);
            return {
              success: true,
              message: "Consulta buro: " + type,
              user: userUpdate,
              score: scoreValue
            };
          }
        }
      }

      if (data.status) {
        console.log("Ya se realizo una consulta buro");
        return {
          success: true,
          message: "Consulta buro: " + type,
          user: user,
          score: user.idClient.score,
        };
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
      buroId = buroCreate._id;
    }

    let ultimaConsulta = await userController.ultimaConsulta();

    if (ultimaConsulta) {
      referenciaOperador = ultimaConsulta.folio + 1;
    } else {
      referenciaOperador = 0000000000000000000000005;
    }

    let databuro = null;

    switch (type) {
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
        databuro = await dataBuro.dataBuroReporte({
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
        user: user,
      };
    }

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
    //   return {
    //   success: false,
    //   message: "Consulta buro",
    //   user: user,
    //   };
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
            name: `${general.name} ${general.lastName}`,
            error: Resburo,
          };
          let dataBuro = await Buro.findById(
            buroId
          );
          let nuevaConsulta = await Consultas.create(data);
          await Buro.findByIdAndUpdate(buroId, {
            consultas: [...dataBuro.consultas, { _id: nuevaConsulta._id }],
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
            status: "ERROR_AUTENTICACION",
            idConsulta: "INTERNO",
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
            name: `${general.name} ${general.lastName}`,
            error: Resburo.respuesta.persona.error,
          };

          let dataBuro = await Buro.findById(
            buroId
          );
          let nuevaConsulta = await Consultas.create(data);
          await Buro.findByIdAndUpdate(buroId, {
            consultas: [...dataBuro.consultas, { _id: nuevaConsulta._id }],
          });

          let score = client.score;

          let error = Resburo.respuesta.persona.error ? Resburo.respuesta.persona.error.ur : "ERROR";

          if(error !== "ERROR"){
            error = JSON.stringify(error);
          }

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
            status: "ERROR" + error,
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
            error: Resburo.respuesta.persona.error,
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
            name: `${comercial.businessName}`,
            resultado: Resburo,
          };

          await ComercialInfo.findByIdAndUpdate(comercialKey, {
            buroMoral: true,
          });

          let dataBuro = await Buro.findById(
            buroId
          );
          let nuevaConsulta = await Consultas.create(data);
          await Buro.findByIdAndUpdate(buroId, {
            consultas: [...dataBuro.consultas, { _id: nuevaConsulta._id }],
          });

          let userUpdate = await User.findById(id);

          return {
            success: true,
            message: "Consulta buro: " + type,
            resultado: Resburo,
            // user: userUpdate,
          };
        }

        let scoreValue = Resburo.respuesta.persona.scoreBuroCredito
          ? Resburo.respuesta.persona.scoreBuroCredito[0].valorScore
          : scoreProspector
          ? scoreProspector
          : "ERROR";

        // let buroId = user.idClient.appliance[0].idBuro._id;
        let moral = user.idClient.type === "PM" ? true : false;

        await dataBuro.resBuro(
          Resburo,
          referenciaOperador,
          buro,
          hubspotDealId,
          client,
          type,
          buroId,
          scoreProspector,
          moral,
          user,
          general,
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

  async buroLogicMoral({ email}) {
    let user = await User.findOne({ email });
    let comercialKey = user.idClient.idComercialInfo;
    let appliance = Appliance.findById(user.idClient.appliance[0]._id);

    if (
      user.idClient.score === undefined ||
      user.idClient.score === null ||
      user.idClient.score === ""
    ) {
      return {
        status: true,
        success: true,
        message: "El cliente no tiene score",
      };
    }

    if ( user.idClient.type !== "PM") {
      return {
        status: true,
        success: true,
        message: "El cliente no es persona moral",
      };
    }

    if (user.idClient.score < 524) {
      return {
        status: true,
        success: true,
        message:
          "El cliente no tiene el score suficiente para consultar el buro moral",
      };
    }

    if (user.idClient.appliance[0].idBuro) {
      let buro = await Buro.findById(user.idClient.appliance[0].idBuro._id);
      let data = await Buro.findById(buro._id);

      if (data) {
        let consultas = data.consultas;
      }

      if (data.moralStatus) {
        return {
          status: true,
          success: true,
          message: "Ya se ha consultado el buro moral",
          consulta: data.consultas,
        };
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
        idBuro: {
          _id: buro._id,
        },
      });
    }

    let comercialInfo = await ComercialInfo.findById(comercialKey);

    let id = user._id;

    if (comercialInfo.firma === true) {
      let moral = await buroHelper.consulta({ id, type: "moral" });
      if (moral.success) {
        await hubspotController.deal.update(
          user.hubspotDealId,
          "single_field",
          {
            value: "SUCCESS SUCCES SUCCES SUCCES",
            name: "estatus_workflow_unykoo_2_buro_moral_",
          }
        );
        return {
          status: true,
          ...moral,
        };
      } else {
        await hubspotController.deal.update(
          user.hubspotDealId,
          "single_field",
          {
            value: "4",
            name: "estatus_workflow_unykoo_2_buro_moral_",
          }
        );
        return {
          success: false,
          ...moral,
        };
      }
    } else {
      return {
        success: false,
        message: "No se puede realizar la consulta se neceita firma",
        user: user,
      };
    }
  },
  async updateMoral(req, res) {
    let { email, firma } = req.body;

    if (firma === "true") {
      firma = true;
    } else {
      firma = false;
    }

    let user = await User.findOne({ email });

    if (user) {
      let comercialKey = user.idClient.idComercialInfo;
      let comercialInfo = await ComercialInfo.findById(comercialKey);

      if (firma) {
        await ComercialInfo.findByIdAndUpdate(comercialKey, {
          firma: firma,
        });

        let moral = await buroHelper.buroLogicMoral({ email });
        
        return res.status(200).json({
          success: true,
          message: "Se actualizo la firma a " + firma,
          moral: moral,
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
  async getConsultas(req, res) {
    let email = req.body.email;
    let token = req.headers["token"];

    if (token != "D7Mqvg5aPcypn97dxdB/Kfe330wwu0IXx0pFQXIFmjs=") {
      return res.status(403).send("A token is required for authentication");
    }

    let user = await User.findOne({ email });

    if (user) {
      let appliance = await Appliance.findById(user.idClient.appliance[0]._id);
      let buro = await Buro.findById(appliance.idBuro._id);

      let comercialKey = user.idClient.idComercialInfo;
      let generalKey = user.idClient.idGeneralInfo;
      let comercialInfo = await ComercialInfo.findById(comercialKey);
      let generalInfo = await GeneralInfo.findById(generalKey);

      let rfc = comercialInfo.rfc;
      let rfcPerson = generalInfo.rfcPerson
        ? generalInfo.rfcPerson
        : comercialInfo.rfc;

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
  },
  async putConsultas(req, res) {

    const { email, consulta } = req.body;
    let token = req.headers["token"];

    let user = await User.findOne({ email });

    if (user) {
      let appliance = await Appliance.findById(user.idClient.appliance[0]._id);
      let client = await Client.findById(user.idClient._id);
      let buro = await Buro.findById(appliance.idBuro._id);
      // let nuevaConsulta = await Consultas.create(consulta);

      console.log(consulta);
      return res.status(200).json({
        success: true,
        message: "Consultas",
        consultas: buro.consultas,
      });

    } else {
      return res.status(200).json({
        success: false,
        message: "No se encontro el usuario",
      });
    }
  }
};

module.exports = buroHelper;
