const admin = require("firebase-admin");

// Configure Firebase Admin SDK avec le bon chemin
admin.initializeApp({
  credential: admin.credential.cert(require("./config/firebase-service-key.json")),
});

const testConnection = async () => {
  try {
    const user = await admin.auth().getUser("s0Vng97l6eMR6GHi9gcLSZBYYPm1");
    console.log("Utilisateur récupéré :", user.email);
  } catch (error) {
    console.error("Erreur de connexion à Firebase :", error);
  }
};

testConnection();


const setCustomClaims = async (uid, role, isApproved) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role, isApproved });
    console.log(`Revendications définies pour ${uid} :`, { role, isApproved });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des revendications :", error);
  }
};

// Remplace "USER_UID" par l'UID de l'utilisateur bloqué
setCustomClaims("s0Vng97l6eMR6GHi9gcLSZBYYPm1", "admin", true);
