const admin = require("firebase-admin");

// Initialiser Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-key.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Fonction pour ajouter un rôle à un utilisateur
async function setCustomClaims(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role: "Super Admin" });
    
  } catch (error) {
    
  }
}

// Appeler la fonction avec l'UID correspondant
setCustomClaims("s0Vng97l6eMR6GHi9gcLSZBYYPm1");
