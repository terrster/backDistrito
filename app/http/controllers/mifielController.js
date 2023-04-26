const { Config } = require("@mifiel/api-client-auth");
const { Template, Model, Document } = require("@mifiel/api-client");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const APP_ID = process.env.MIFIEL_APP_ID;
const APP_SECRET = process.env.MIFIEL_TOKEN;

const miFielController = {
  async index(req, res) {
    console.log("mifiel", APP_ID, APP_SECRET);
    const Configuracion = Config.setTokens({
      appId: APP_ID,
      appSecret: APP_SECRET,
      env: "sandbox",
    });

    const file = path.join(__dirname, "../../../public/tmpFiles/Factura4.pdf");
    const fileBuffer = fs.readFileSync(file);

    const hexHash = await Document.getHash(fileBuffer);

    try {
        const data = {
            file: file,
            signatories: [
                {
                    tax_id: "AAA010101AAA",
                    email: "terrorkmr@gmail.com",
                    name: "Juan Perez",
                    external_id: "1234",
                },
            ],
            callback_url: "https://08ac-2806-2f0-90c0-b9fa-20fc-83ee-f712-a1e0.ngrok-free.app/private/api/buro/casa",
        };

        const document = await Document.create(data);
        console.log("document", document);

        return res.json({ mensaje: "ok" });

    } catch (error) {
        console.log("error", error);
        return res.json({ mensaje: "error" });
    }
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
