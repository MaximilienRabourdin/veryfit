const admin = require("firebase-admin");

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require("../config/firebase-service-key.json")),
});

async function checkClaims(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Revendications pour ${email} :`, user.customClaims);
  } catch (error) {
    console.error("Erreur lors de la vérification des revendications :", error);
  }
}

// Remplacez par l'adresse e-mail que vous voulez vérifier
checkClaims("kdjoubri@fit-doors.fr");
