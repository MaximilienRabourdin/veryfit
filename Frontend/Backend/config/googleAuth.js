const { google } = require("googleapis");
const path = require("path");

const KEYFILE_PATH = path.join(__dirname, "../config/google-service-account.json"); 

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

module.exports = auth;
