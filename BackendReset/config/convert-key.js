// convert-key.js
const fs = require("fs");

const serviceKey = require("./firebase-service-key.json"); // adapte le chemin si besoin
serviceKey.private_key = serviceKey.private_key.replace(/\n/g, "\\n");

const oneLine = JSON.stringify(serviceKey);
fs.writeFileSync("service-account-one-line.json", oneLine);
console.log("✅ Fichier 'service-account-one-line.json' prêt à copier dans Railway.");
