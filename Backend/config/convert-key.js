const fs = require("fs");

const raw = fs.readFileSync("google-service-account.json", "utf-8");
const escaped = JSON.stringify(JSON.parse(raw));

fs.writeFileSync("service-account-one-line.json", escaped);

console.log("✅ Clé convertie dans service-account-one-line.json");
