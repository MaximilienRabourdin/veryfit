require("dotenv").config();

try {
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
  const parsed = JSON.parse(decoded);

  console.log("✅ Clé décodée avec succès !");
  console.log(parsed);
} catch (err) {
  console.error("❌ Erreur de décodage ou parsing :", err.message);
}
