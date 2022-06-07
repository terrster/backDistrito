const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { env } = require('process');

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  let TOKEN_PATH;
  if((process.env.APP_ENV === 'dev' || process.env.APP_ENV === 'local')){
     TOKEN_PATH = 'tokenDev.json';
  } else {
    TOKEN_PATH = 'token.json';
  }
  
  

const shhets = {
  start: (rfc, ciec) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      shhets.authorize(JSON.parse(content), shhets.append, rfc, ciec);
    });
  },

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
authorize: (credentials, callback, rfc, ciec) => {
  let {client_secret, client_id, redirect_uris} = credentials.installed;
  let oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return shhets.getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    let prueba = callback(oAuth2Client, rfc, ciec);
    console.log(prueba);
  });
},

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
getNewToken: (oAuth2Client, callback) => {
  let authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
},

/**
 * Prints the rfc and ciec not found in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1K64BTeT-zCDKQ9pcMrIilcPMGNn8xk7a9ghRg7kMxIo/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
append: async (auth, rfc, ciec) => {
    let n4_93_ciec = ciec;
    n4_93_ciec = Buffer.from(n4_93_ciec).toString('base64');
    const sheets = google.sheets({version: 'v4', auth});
    let resource = {};
    let SID;
    if((process.env.APP_ENV === 'dev' || process.env.APP_ENV === 'local')){
      resource = {values: [
        [rfc, n4_93_ciec, 'dev'],
      ]
    }
    SID = '1K64BTeT-zCDKQ9pcMrIilcPMGNn8xk7a9ghRg7kMxIo';
  }else {
    resource = {values: [
      [rfc, n4_93_ciec],
    ]}
    SID = '1GD4cJZAlX5u4wJpLIS0tS9omxZQbnyP0IkfRiJ7gkY8'
  }

  let request = {
    spreadsheetId: SID,
    range: 'A1:C3',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: resource,

  };
    
    try {
        await new Promise((resolve, reject) => {
         return sheets.spreadsheets.values.append(request, (err, response) => {
          if (err) {
            functions.logger.log(`The API returned an error: ${err}`);
            return reject(err);
          }
          return resolve(response.data);
        });
      });
    } catch (error) {
        console.log(error);
    }
}
}
module.exports = shhets; 