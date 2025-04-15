const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 👉 Modifier ici
const uid = "TON_UID_ICI"; // Remplace par l'UID Firebase réel
const role = "carrossier"; // carrossier | revendeur | controleur | utilisateur | admin | Super Admin
const isApproved = true;

admin
  .auth()
  .setCustomUserClaims(uid, { role, isApproved })
  .then(() => {
    console.log(`✅ Rôle "${role}" défini avec succès pour l'utilisateur ${uid}`);
  })
  .catch((error) => {
    console.error("❌ Erreur définition des claims :", error);
  });
