const User = require("../models/User");
const Documents = require("../models/Documents");
const ComercialInfo = require("../models/ComercialInfo");
const Appliance = require("../models/Appliance");
const hubspotController = require("./hubspotController");
const { response } = require("express");
const { ElasticInference } = require("aws-sdk");
const { getTestMessageUrl } = require("nodemailer");
const _axios = require("axios").default;

/*
 * @description Funcion que permite obtener la informacion de un usuario en metamap
 * @endpoint /api/meta/consulta
 * @method POST
 * @access Public
 * @version 1.0.0
 * @author Jonathan
 * @date 2022-09
 * @code 200 - OK
 * @code 419 - documento rechazado
 * @code 420 - error al obtener la informacion del usuario
 */
const getNameProperty = (key) => {
  switch (key) {
    case "oficialID":
      return ["n9_1_id", "n9_1_2_id", "n9_1_3_id", "n9_1_4_id"];
    case "proofAddress":
    case "proofAddressMainFounders":
      return [
        "n9_2_comp_domicilio",
        "n9_2_1_comp_domicilio_2",
        "n9_2_2_comp_domicilio_3",
      ];
    case "bankStatements":
      return [
        "n9_3_estados_de_cuenta",
        "n9_3_1_estados_de_cuenta",
        "n9_3_2_estados_de_cuenta",
        "n9_3_3_estados_de_cuenta",
        "n9_3_4_estados_de_cuenta",
        "n9_3_5_estados_de_cuenta",
        "n9_3_6_estados_de_cuenta",
        "n9_3_7_estados_de_cuenta",
        "n9_3_8_estados_de_cuenta",
        "n9_3_9_estados_de_cuenta",
        "n9_3_10_estados_de_cuenta",
        "n9_3_11_estados_de_cuenta",
      ];
    case "rfc":
      return ["n9_4_rfc"];
    case "rfcSocio":
      return ["n7_08_csf_socio"];
    case "lastDeclarations":
      return [
        "n9_5_declaraci_n",
        "n9_5_1_declaraci_n",
        "n9_5_2_declaraci_n",
        "n9_5_3_declaraci_n",
      ];
    // case "acomplishOpinion":
    //     return [
    //         'n9_6_opini_n_de_cumplimiento'
    //     ];
    case "constitutiveAct":
      return ["n9_9_acta_constitutiva"];
    case "otherActs":
      return ["n9_92_1_escritura", "n9_92_2_escritura", "n9_92_3_escritura"];
    case "financialStatements":
      return [
        "n9_93_1_eeff",
        "n9_93_1_1_eeff",
        "n9_93_2_eeff",
        "n9_93_2_1_eeff",
        "n9_93_3_eeff",
        "n9_93_3_1_eeff",
      ];
    case "others":
      return [
        "n9_8_otros",
        "n9_8_1_otros_2",
        "n9_8_2_otros_3",
        "n9_8_3_otros_4",
      ];
    case "collectionReportSaleTerminals":
      return ["n9_94_reporte_de_cobranza_tpv"];
    case "localContractLease":
      return ["n9_95_contrato_de_arrendamiento_tpv"];
    case "guaranteeStatement":
      return [
        "n7_82_escritura_propiedad",
        "n7_82_recibo_agua",
        "n7_82_predial",
        "n7_82_otros_docs_garantia_inmob_1",
        "n7_82_otros_docs_garantia_inmob_2",
      ];
    case "guaranteeFixedAssets":
      return [
        "n7_83_factura_o_cotizacion",
        "n7_83_ficha_tecnica",
        "n7_83_fotos_del_equipo",
        "n7_83_otros_docs_activo_fijo_1",
        "n7_83_otros_docs_activo_fijo_2",
      ];
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

const getUrl = async (url, token, con) => {
  return await until(
    () => {
      return _axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((doc) => {
          if (doc) {
            if (con) {
              return doc.con;
            } else {
              return doc;
            }
          }
          return false;
        });
    },
    1000,
    10
  );
};

const metamapController = {
  listener: async (request, response) => {
    const completed = [
      "verification_completed",
      "verification_inputs_completed",
    ];

    const accions = [
      "bankStatements",
      "oficialID",
      "proofAddress",
      // "others",
      // "guaranteeStatement",
      // "guaranteeFixedAssets",
      // "constitutiveAct",
    ]

    if (request.body.metadata === undefined) {
      return response.status(200).json({ message: "event online" });
    }

    if (request.body.eventName) {
      if (completed.includes(request.body.eventName)) {
        let { metadata, eventName } = request.body;
        if (accions.includes(metadata.accion) && eventName === "verification_inputs_completed") {
          return response
            .status(200)
            .json({ message: "await for verification" });
        }
        console.log("metadata", metadata.accion);
      } else {
        console.log("event", request.body.eventName);
        return response.status(200).json({ message: "no supported" });
      }
    }
    const { metadata, resource } = request.body;
    const token = await metamapController.getToken();

    if (token === undefined || token === null) {
      return response.status(420).json({ message: "error getting token" });
    }
    await metamapController.consulta({ metadata, resource, token }, response)
  },
  getToken: async () => {
    const axios = _axios.create({
      baseURL: "https://api.getmati.com/",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic NjJmMTVhZDI0NjIxZDcwMDFjYWE1NDcyOlA1Q05WV1FKUDZFRUhBM0dBVkRUS1o0VU9KU1BNN0dK",
      },
    });
    payload = "grant_type=client_credentials";
    return await axios
      .post("oauth", payload)
      .then((res) => {
        return res.data.access_token;
      })
      .catch((err) => {
        console.log("err", err);
        return null;
      });
  },
  consulta: async (request, response) => {
    const { metadata, resource, token } = request;
    const { accion } = metadata;
    const url = resource;
    const user = await User.findById(metadata.userId);
    if (!user) {
      console.log("user not found");
      return response.status(420).json({ message: "user not found" });
    }

    let hubspotDealId = user.hubspotDealId;

    let Document = await Documents.findOne({ idClient: user.idClient._id });

    if (!Document) {
      let documentStored = await Documents.create({
        idClient: {
          _id: user.idClient._id,
        },
      });
      await Appliance.findByIdAndUpdate(user.idClient.appliance[0]._id, {
        idDocuments: {
          _id: documentStored._id,
        },
      });
      Document = documentStored;
    }
    if (
      Document["guaranteeStatement"] === undefined ||
      Document["guaranteeFixedAssets"] === undefined
    ) {
      let docUpdate = await Documents.findByIdAndUpdate(Document._id, {
        guaranteeStatement: [],
        guaranteeFixedAssets: [],
      });
      Document = docUpdate;
    }

    let idDocument = Document._id;
    await _axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        const { data } = res;

        let { documents, steps } = data;
        let params = {};
        let { properties } = await hubspotController.deal.show(hubspotDealId);

        if (documents.length === 0 && steps.length === 0) {
          return response
            .status(200)
            .json({ message: "event already processed" });
        }

        if (documents.length === 0 && steps.length !== 0) {
          let status = 0;
          console.log("steps", status);
          for (let i = 0; i < steps.length; i++) {
            status = steps[i].status;

            while (status !== 200) {
              await delay(8000);
              const res = await getUrl(url, token);
              if (res) {
                status = res.data.steps[i].status;
                status === 200 ? (steps = res.data.steps) : null;
              }
            }
            steps[i].data.statements.forEach((statement) => {
              statement.type = "bankStatements";
            });
            documents = steps[i].data.statements;
          }
        }

        documents.forEach((doc) => {
          let type = doc.type;
          let arrUrls = [];
          let accName = "";

          switch (accion) {
            case "oficialID":
              if (type === "national-id") {
                accName = "oficialID";
              } else if (type === "passport") {
                accName = "oficialID";
              } else if (type === "proof-of-residency") {
                accName = "proofAddressMainFounders";
              } else {
                accName = "oficialID";
              }
              break;
            case "constitutiveAct":
              if (type === "custom-constitutiva") {
                accName = "constitutiveAct";
              } else {
                accName = "otherActs";
              }
              break;
            case "lastDeclarations":
              if (type === "custom-csf") {
                accName = "rfcSocio";
              } else {
                accName = "lastDeclarations";
              }
              break;
            default:
              accName = accion;
          }

          for (const key in doc) {
            switch (key) {
              case "photos":
                doc[key].forEach((photo) => {
                  arrUrls = [...arrUrls, { url: photo, name: accName }];
                });
                break;
              case "pdf":
                arrUrls = [...arrUrls, { url: doc[key], name: accName }];
                break;
              case "internalUrl":
                arrUrls = [...arrUrls, { url: doc[key], name: accName }];
                break;
              default:
                break;
            }
          }
          if (params[accName] === undefined) {
            params[accName] = [];
          }
          params[accName] = [...arrUrls, ...params[accName]];
        });

        for (key in params) {
          if (params[key].length === 0) {
            delete params[key];
          }
          let hs_property_names = getNameProperty(key);
          let helper = {};
          let arrhelper = params[key] === undefined ? [] : params[key];
          // let name = "";
          if (Document[key] === undefined) {
            Document[key] = [];
          }
          helper[key] = [...arrhelper, ...Document[key]]; ///esperar a que se suban los documentos
          // console.log("helper", helper);
          await getUpdate(Documents, idDocument, helper);

          await arrhelper.forEach(async (element) => {
            // console.log("element", element);
            let value = element.url;
            let name = "";

            for (let i = 0; i < hs_property_names.length; i++) {
              if (properties[hs_property_names[i]] === undefined) {
                name = hs_property_names[i];
                properties[hs_property_names[i]] = {
                  value: value,
                };
                break;
              } else if (properties[hs_property_names[i]].value === "") {
                name = hs_property_names[i];
                properties[hs_property_names[i]].value = value;
                break;
              }
            }

            console.log("name", name);

            if (name !== "") {
              hubspotController.deal
                .update(hubspotDealId, "single_field", { value, name })
                .catch((err) => {
                  console.log("err", err);
                  throw new error(err);
                });
            }
          });
        }

        let documentUpdate = await getPro(Documents, Document._id);

        // console.log("documentUpdate", documentUpdate);
        let userUpdate = await getPro(User, user._id);

        global.io.emitToSocket(metadata.socketId, "updateUser", {
          documentUpdate,
          userUpdate,
        });
        return response.status(200).json({ message: "success" });
      })
      .catch((err) => {
        console.log(err);
        return response.status(200).json({ message: "error" });
      });
  },
  webhook: async (request, response) => {
    return response.status(200).json({ message: "ok" });
  },
  saveHubspot: async ({
    arrUrls,
    idDocument,
    Document,
    paramName,
    response,
    properties,
    hubspotDealId,
  }) => {
    let hs_property_names = getNameProperty(paramName);

    let valueDoc = Document[paramName];
    let params = {};
    newValues = [];

    for (let i = 0; i <= hs_property_names.length; i++) {
      const name = hs_property_names[i];
      if (properties[name] !== undefined) {
        hs_property_names.splice(i, 1);
      }
      if (properties[name] !== undefined && properties[name].value !== "") {
        hs_property_names.splice(i, 1);
      }
    }

    if (hs_property_names.length === 0) {
      return;
    } else {
      for (let i = 0; i < arrUrls.length; i++) {
        let value = arrUrls[i];
        let name = hs_property_names[i];
        if (name === undefined) {
          null;
        } else {
          await hubspotController.deal.update(hubspotDealId, "single_field", {
            value,
            name,
          });
        }
      }
    }
  },
  updateSate: async (request, response) => {
    console.log("updateSate");
    const { metadata, status } = request.body;
    const { docID, socketId, uid, dealId } = metadata;
    // const Document = await Documents.findByIdAndUpdate(docID, {
    //   status: status,
    // });
    await hubspotController.deal.update(dealId, "single_field", {
      value: "OK",
      name: "n8_91_validaciones_metamap",
    });
    await getUpdate(Documents, docID, { status: status }); //update status
    const user = await getPro(User, uid);
    return response.status(200).json({ message: "user updated", user });
  },
  updateData: async (request, response) => {
    const token = await metamapController.getToken();
    const url =
      "https://api.getmati.com/v2/verifications/633c8284169bfe001cbccce4";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    await _axios
      .get(url, { headers })
      .then(async (res) => {
        const { data } = res;
        let { documents, metadata, steps } = data;
        const user = await getPro(User, metadata.userId);
        let Document = await Documents.findOne({ idClient: user.idClient._id });

        const { accion } = metadata;

        let params = {};

        let hubspotDealId = user.hubspotDealId;
        let { properties } = await hubspotController.deal.show(hubspotDealId);

        if (documents.length === 0 && steps.length === 0) {
          return response
            .status(200)
            .json({ message: "event already processed" });
        }

        if (documents.length === 0 && steps.length !== 0) {
          let status = 0;
          for (let i = 0; i < steps.length; i++) {
            status = steps[i].status;

            while (status !== 200) {
              await delay(8000);
              const res = await getUrl(url, token);
              if (res) {
                status = res.data.steps[i].status;
                status === 200 ? (steps = res.data.steps) : null;
              }
            }
            steps[i].data.statements.forEach((statement) => {
              statement.type = "bankStatements";
            });
            documents = steps[i].data.statements;
          }
        }

        await documents.forEach(async (doc) => {
          let type = doc.type;
          let arrUrls = [];
          let accName = "";

          switch (accion) {
            case "oficialID":
              if (type === "national-id") {
                accName = "oficialID";
              } else if (type === "passport") {
                accName = "oficialID";
              } else if (type === "proof-of-residency") {
                accName = "proofAddressMainFounders";
              } else {
                accName = "oficialID";
              }
              break;
            case "constitutiveAct":
              if (type === "custom-constitutiva") {
                accName = "constitutiveAct";
              } else {
                accName = "otherActs";
              }
              break;
            case "lastDeclarations":
              if (type === "custom-csf") {
                accName = "rfcSocio";
              } else {
                accName = "lastDeclarations";
              }
              break;
            default:
              accName = accion;
          }

          for (const key in doc) {
            switch (key) {
              case "photos":
                doc[key].forEach((photo) => {
                  arrUrls = [...arrUrls, { url: photo, name: accName }];
                });
                break;
              case "pdf":
                arrUrls = [...arrUrls, { url: doc[key], name: accName }];
                break;
              case "internalUrl":
                arrUrls = [...arrUrls, { url: doc[key], name: accName }];
                break;
              default:
                break;
            }
          }
          if (params[accName] === undefined) {
            params[accName] = [];
          }
          params[accName] = [...arrUrls, ...params[accName]];
        });

        // for (key in params) {
        //   if (params[key].length === 0) {
        //     delete params[key];
        //   }
        //   let hs_property_names = getNameProperty(key);
        //   let helper = {};
        //   let arrhelper = params[key];
        //   // let name = "";
        //   helper[key] = [...arrhelper, ...Document[key]];
        //   // console.log("helper", helper);
        //   await getUpdate(Documents, idDocument, helper);

        //   await arrhelper.forEach(async (element) => {
        //     // console.log("element", element);
        //     let value = element.url;
        //     let name = "";

        //     for (let i = 0; i < hs_property_names.length; i++) {
        //       if (properties[hs_property_names[i]] === undefined) {
        //         name = hs_property_names[i];
        //         properties[hs_property_names[i]] = {
        //           value: value,
        //         };
        //         console.log(properties[hs_property_names[i]]);
        //         break;
        //       } else if (properties[hs_property_names[i]].value === "") {
        //         name = hs_property_names[i];
        //         properties[hs_property_names[i]].value = value;
        //         break;
        //       }
        //     }

        //     console.log("name", name);

        //     if (name !== "") {
        //       await hubspotController.deal.update(
        //         hubspotDealId,
        //         "single_field",
        //         { value, name }
        //       ).catch((err) => {
        //         console.log("err", err);
        //         throw new error(err);
        //       });
        //     }
        //   });
        // }

        const updateFiles = Object.keys(params).map(async (key) => {
          if (params[key].length === 0) {
            delete params[key];
          }
          let hs_property_names = getNameProperty(key);
          let helper = {};
          let arrhelper = params[key];
          // let name = "";
          helper[key] = [...arrhelper, ...Document[key]];
          // console.log("helper", helper);
          // await getUpdate(Documents, idDocument, helper);

          Object.keys(arrhelper).map(async (element) => {
            console.log("element", element);
            console.log(params[key][element]);
          });
        });

        await Promise.all(updateFiles);

        return response.status(200).json({ message: "user updated", data });
      })
      .catch((err) => {
        console.log("err", err);
        return response.status(200).json({ message: "user err", err });
      });
  },
};

module.exports = metamapController;
