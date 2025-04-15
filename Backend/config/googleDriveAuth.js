const { google } = require("googleapis");
const path = require("path");

// Chemin vers ton fichier JSON de compte de service
const KEYFILEPATH = path.join(__dirname, "./google-service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

module.exports = auth;
