const { Config } = require("@mifiel/api-client-auth");
const FiscalInfo = require("../models/Fiscal");
const { Template, Model, Document } = require("@mifiel/api-client");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const User = require("../models/User");

const APP_ID = process.env.MIFIEL_APP_ID;
const APP_SECRET = process.env.MIFIEL_TOKEN;
const ENV = process.env.MIFIEL_ENV;

const miFielController = {
  async create(req, res) {
    const rfc = req.body.rfc;
    const userId = req.params.id;

    try {

    const user = await User.findById(userId);
    const { email } = user;

    console.log("email", email);

    const fiscal = await FiscalInfo.findOne({ rfcMoral: rfc });

    if (!fiscal) {
      return res.json({ mensaje: "No se encontro el RFC" });
    }

    const { buroMoral } = fiscal;

    const Configuracion = Config.setTokens({
      appId: APP_ID,
      appSecret: APP_SECRET,
      env: "sandbox",
    })

    if(buroMoral.documentId !== null && buroMoral.documentId !== undefined) {
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

      const file = path.join(__dirname, "../../../public/tmpFiles/Factura4.pdf");

      const data = {
        file: file,
        signatories: [
            {
                tax_id: rfc,
                email: email,
                name: "Juan Perez",
                external_id: "1234",
            },
        ],
        callback_url: "https://aaa0-2806-2f0-90c0-b9fa-b124-ecfe-4508-2967.ngrok-free.app/private/api/mifiel/documents",
    };

        const document = await Document.create(data);

        const { signers, id } = document;
        let dataSigners = {};

        for(const signer of signers) {
            const { id, widget_id } = signer;
            if(signer.email === email) {
                console.log("signer", signer);
                dataSigners = {
                    id : document.id,
                    widgetid: signer.widget_id
                }
                break;
            }
        }

        console.log("dataSigners", dataSigners);

        await FiscalInfo.findOneAndUpdate({ rfcMoral: rfc }, 
          {
            buroMoral: {
                ...fiscal.buroMoral,
                documentId: document.id,
                widgetId: dataSigners.widgetid
            }
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
  async index(req, res) {
    
    const Configuracion = Config.setTokens({
      appId: "17417d350087fdb8270428202d5750358c993ba2",
      appSecret: "eCDRePVo97Gt3MDUmmaxZ1B8LwC4HaEv3EjO2C3Fv/sYNBEOFXDGv2/BBzu1tuBcS87AuMvKZwfEqkKUna9v6w==",
      env: ENV,
    });

    try {
    const fields = await Template.getFields({ templateId: '98f9ae82-1762-4372-a12c-fa1714c2c42c' });

    const document = await Template.generateDocument({
      templateId: '98f9ae82-1762-4372-a12c-fa1714c2c42c',
      document: {
        name: 'prueba documento',
        signatories: [{
          name: 'Juan Perez',
          email: 'terrorkmr@gmail.com',
          tax_id: 'FSE920910CC6'
        }],
        callback_url: "https://aaa0-2806-2f0-90c0-b9fa-b124-ecfe-4508-2967.ngrok-free.app/private/api/mifiel/documents",
      }
    });

    console.log("document", document);
    return res.json({ mensaje: "ok" });
    const documents = await Template.generateDocuments({
      templateId: '98f9ae82-1762-4372-a12c-fa1714c2c42c',
      callback_url: 'https://aaa0-2806-2f0-90c0-b9fa-b124-ecfe-4508-2967.ngrok-free.app/private/api/mifiel/documents',
      documents: [{
        name: 'Mi primer documento',
        // ...
      }]
    });
    console.log("document", document);
    return res.json({ mensaje: "ok" });
    } catch (error) {
      console.log("error", error);
      return res.json({ mensaje: "error" });
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
