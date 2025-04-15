const admin = require("firebase-admin");

// Configure Firebase Admin SDK avec le bon chemin
admin.initializeApp({
  credential: admin.credential.cert(require("./config/firebase-service-key.json")),
});

const testConnection = async () => {
  try {
    const user = await admin.auth().getUser("s0Vng97l6eMR6GHi9gcLSZBYYPm1");
  } catch (error) {
  }
};

testConnection();


const setCustomClaims = async (uid, role, isApproved) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role, isApproved });
  } catch (error) {
  }
};

// Remplace "USER_UID" par l'UID de l'utilisateur bloqué
setCustomClaims("s0Vng97l6eMR6GHi9gcLSZBYYPm1", "admin", true);
