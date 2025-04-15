const admin = require("firebase-admin");

// Configure Firebase Admin SDK avec le bon chemin
admin.initializeApp({
  credential: admin.credential.cert(require("./config/firebase-service-key.json")),
});

const checkCustomClaims = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
  } catch (error) {
  }
};

// Remplace "USER_UID" par l'UID de l'utilisateur bloqué
checkCustomClaims("s0Vng97l6eMR6GHi9gcLSZBYYPm1");
