const { Config } = require("@mifiel/api-client-auth");
const FiscalInfo = require("../models/Fiscal");
const { Template, Model, Document } = require("@mifiel/api-client");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const User = require("../models/User");
const ComercialInfo = require("../models/ComercialInfo");
const GeneralInfo = require("../models/GeneralInfo");

const APP_ID = process.env.MIFIEL_APP_ID;
const APP_SECRET = process.env.MIFIEL_TOKEN;
const TemplateId = process.env.MIFIEL_TEMPLATE_ID;
const ENV = process.env.MIFIEL_ENV;

const miFielController = {
  async create(req, res) {
    const rfc = req.body.rfc;
    const userId = req.params.id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ mensaje: "No se encontro el usuario" });
      }

      const { idClient, email, phone } = user;
      const { idComercialInfo, idGeneralInfo } = idClient;
      const comercialInfo = await ComercialInfo.findById(idComercialInfo);
      const generalInfo = await GeneralInfo.findById(idGeneralInfo);

      let fiscal = await FiscalInfo.findOne({ rfcMoral: rfc });

      if (!fiscal) {
        if (idClient.type !== "PM") {
          return res.status(200).json({
            mensaje: "No es persona moral",
            code: 1,
          });
        }

        const comercialRFC = comercialInfo.rfc;

        fiscal = await FiscalInfo.create({
          rfcMoral: comercialRFC,
        });
      }

      const { buroMoral } = fiscal;

      if (buroMoral.documentId !== null && buroMoral.documentId !== undefined) {
        console.log("buroMoral", buroMoral);

        const Configuracion = Config.setTokens({
          appId: APP_ID,
          appSecret: APP_SECRET,
          env: ENV,
        });

        let document = await Document.find(buroMoral.documentId);
        const { signers, id } = document;
        for (const signer of signers) {
          if (signer.email === email) {
            return res.status(200).json({
              mensaje: "ok",
              documento: document,
              widgetId: signer.widget_id,
            });
          }
        }
      }

      const representante_legal =
        generalInfo.name +
        " " +
        generalInfo.lastname +
        " " +
        generalInfo.secondLastname;

      const data = {
        razon_social: comercialInfo.businessName,
        address: comercialInfo.address,
        email,
        phone,
        representante_legal,
        rfc: fiscal.rfcMoral,
      };

      console.log("data", data);

      const { document, success, error } = await miFielController.index(data);

      if (!success) {
        return res.status(200).json({
          mensaje: "error",
          code: 2,
          error,
        });
      }

      const { signers, id } = document;
      let dataSigners = {};

      for (const signer of signers) {
        const { id, widget_id } = signer;
        if (signer.email === email) {
          console.log("signer", signer);
          dataSigners = {
            id: document.id,
            widgetid: signer.widget_id,
          };
          break;
        }
      }

      console.log("dataSigners", dataSigners);

      await FiscalInfo.findOneAndUpdate(
        { rfcMoral: rfc },
        {
          buroMoral: {
            ...fiscal.buroMoral,
            documentId: document.id,
            widgetId: dataSigners.widgetid,
          },
        }
      );

      return res.status(200).json({
        mensaje: "ok",
        documento: document,
        dataSigners,
        widgetId: dataSigners.widgetid,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ mensaje: "error" });
    }
  },
  async index({
    razon_social,
    address,
    email,
    phone,
    representante_legal,
    rfc,
  }) {
    const Configuracion = Config.setTokens({
      appId: APP_ID,
      appSecret: APP_SECRET,
      env: ENV,
    });

    const nameDocument = "Aut_BC_PM_" + razon_social.split(" ").join("_");

    try {
      const document = await Template.generateDocument({
        templateId: TemplateId,
        document: {
          name: nameDocument,
          send_mail: true,
          signatories: [
            {
              name: razon_social,
              email: email,
              tax_id: rfc,
            },
          ],
          fields: {
            razon_social: razon_social,
            nombre_rep_legal: representante_legal,
            rfc: rfc,
            calle_y_numero: address.street + " " + address.extNumber,
            colonia: address.town,
            ciudad: address.municipality,
            estado: address.state,
            codigo_postal: address.zipCode,
            telefono: phone,
          },
          viewers: [
            {
              name: "Distrito Pyme",
              email: "documentos@distritopyme.com",
            },
          ],
          // sign_callback_url:
          //   "https://dev.localhost.ngrok-free.app/private/api/mifiel/documents",
        },
      });

      return {
        success: true,
        document: document,
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        error: error,
      };
    }

    //rfc distritopyme
    // buro de fisica es viable === razon social === mandar mensaje necesitamos la autorizacion de buro Moral // button saber más // botton firmar Ahora // botton no cuento e.firma a la mano, firmar despues ===
    // puedes regresar en cualquier momento para firmar tu documento mismo que tambien sera enviado via correo electronico, continuamos con tus documentos, imagen para regresar a la pagina

    // !buro no viable salta a documentos

    // buro fisica es viable !== razon social === documentos

    const hexHash = await Document.getHash(fileBuffer);

    // try {
    //     const data = {
    //         file: file,
    //         signatories: [
    //             {
    //                 tax_id: "AAA010101AAA",
    //                 email: "terrorkmr@gmail.com",
    //                 name: "Juan Perez",
    //                 external_id: "1234",
    //             },
    //         ],
    //         callback_url: "https://08ac-2806-2f0-90c0-b9fa-20fc-83ee-f712-a1e0.ngrok-free.app/private/api/buro/casa",
    //     };

    //     const document = await Document.create(data);
    //     console.log("document", document);

    //     return res.json({ mensaje: "ok" });

    // } catch (error) {
    //     console.log("error", error);
    //     return res.json({ mensaje: "error" });
    // }
  },
  async listener(req, res) {
    console.log("listener", req.body);
    return res.json({ mensaje: "ok" });
  },
};

module.exports = miFielController;

// const config = new Config({
//   clientId: "YOUR_CLIENT_ID",
//   appSecret: " APP_SECRET",
//   env: "sandbox",
// });

// const mifiel = require("@mifiel/api-client")(config);

// const documents = mifiel.documents;

// const document = await documents.create({
//   file: "path/to/file.pdf",
//   signatories: [
//     {
//       tax_id: "AAA010101AAA",
//       email: "terrorkmr@gmail.com",
//       name: "Juan Perez",
//       external_id: "1234",
//     },
//   ],
// });

// const signatureRequests = mifiel.signatureRequests;

// const signatureRequest = await signatureRequests.create({
//   document_id: document.id,
//   callback_url: "https://yourapp.com/callback",
//   signatories: [
//     {
//       tax_id: "AAA010101AAA",
//       email: "terrorkmr@gmail.com",
//       name: "Juan Perez",
//       external_id: "1234",
//     },
//   ],
// });

// const signatures = mifiel.signatures;

// const signature = await signatures.create({
//   signature_request_id: signatureRequest.id,
//   document_id: document.id,
//   file: "path/to/file.pdf",
//   signatory_id: signatureRequest.signatories[0].id,
// });
