const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { env } = require("process");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = process.env.tokenPath;

const auth = new google.auth.GoogleAuth({
  keyFile: TOKEN_PATH,
  scopes: SCOPES,
});

const shhets = {
  start: (rfc, ciec) => {
    shhets.append(auth, rfc, ciec);
  },

  /**
   * Prints the rfc and ciec not found in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1K64BTeT-zCDKQ9pcMrIilcPMGNn8xk7a9ghRg7kMxIo/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  append: async (auth, rfc, ciec) => {
    let n4_93_ciec = ciec;
    n4_93_ciec = Buffer.from(n4_93_ciec).toString("base64");
    const sheets = google.sheets({ version: "v4", auth });
    let resource = {};
    let SID;
    let dateUTC = new Date();
    let date = dateUTC.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      // timeZoneName: 'short'
    });

    if (process.env.APP_ENV === "dev" || process.env.APP_ENV === "local") {
      resource = { values: [[rfc, n4_93_ciec, "dev", date]] };
      SID = "1K64BTeT-zCDKQ9pcMrIilcPMGNn8xk7a9ghRg7kMxIo";
    } else {
      resource = { values: [[rfc, n4_93_ciec, date]] };
      SID = "1GD4cJZAlX5u4wJpLIS0tS9omxZQbnyP0IkfRiJ7gkY8";
    }

    let request = {
      spreadsheetId: SID,
      range: "A1:D1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: resource,
    };

    try {
      await new Promise((resolve, reject) => {
        return sheets.spreadsheets.values.append(request, (err, response) => {
          if (err) {
            console.log(`The API returned an error: ${err}`);
            return reject(err);
          }
          return resolve(response.data);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  saveBuro: async (req) => {
    console.log("saveBuro", req.producto);
    const sheets = google.sheets({ version: "v4", auth });
    let dateUTC = new Date();
    let date = dateUTC.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      // timeZoneName: 'short'
    });
    let SID = ""
    let values = [];
    if (process.env.APP_ENV === "dev" || process.env.APP_ENV === "local") {
      switch (req.producto) {
        case "Auth":
          SID = "1rwbu8jRdm2BVY43qPEgfl1yxi-JnPVEnEcKnG5q3MeI";
          values = [
            date,
            req.referenciaOperador,
            req.data,
            req.ejercidoCreditoAutomotriz,
            req.ejercidoCreditoHipotecario,
            req.tarjetaCredito,
            req.ultimosCuatroDigitos
          ]
          break;
        case "Score":
          SID = "19QwPZAhJnibjNsYsNHX9UkccCLRUGmYj2gC6De1F9Mk";
          values = [
            date,
            req.numeroControlConsulta,
            req.rfc,
            req.apellidoPaterno,
            req.apellidoMaterno,
            req.primerNombre,
            req.valorScore,
          ]
          break;
        case "Buro":
          console.log("Buro");
          SID = "19QwPZAhJnibjNsYsNHX9UkccCLRUGmYj2gC6De1F9Mk";
          values = [
            date,
            req.numeroControlConsulta,
            req.rfc,
            req.apellidoPaterno,
            req.apellidoMaterno,
            req.primerNombre,
            req.valorScore,
          ]
        default:
          break;
      }
    } else {
      SID = "1GD4cJZAlX5u4wJpLIS0tS9omxZQbnyP0IkfRiJ7gkY8";
    }
    let request = {
      spreadsheetId: SID,
      range: "A1:D1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [
          values,
        ],
      },
    };
      await new Promise((resolve, reject) => {
        return sheets.spreadsheets.values.append(request, (err, response) => {
          if (err) {
            console.log(`The API returned an error:`,err.response.data.error);
            return reject(err);
          }
          return resolve(response);
        });
      });

  },
};
module.exports = shhets;
