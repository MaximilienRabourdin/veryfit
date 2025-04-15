const admin = require("firebase-admin");

// Vérifier si Firebase Admin est déjà initialisé
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-key.json"); // Assurez-vous que ce chemin est correct
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialisé !");
}

const db = admin.firestore();

/**
 * Endpoint pour attribuer des Custom Claims à un utilisateur Firebase
 */
module.exports = async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ success: false, message: "UID et rôle requis." });
  }

  try {
    // 🔹 Vérification si l'utilisateur existe dans Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    if (!userRecord) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    // 🔹 Définition des claims personnalisés
    await admin.auth().setCustomUserClaims(uid, { role, isApproved: true });

    // 🔹 Mise à jour des informations dans Firestore
    await db.collection("users_webapp").doc(uid).update({
      role,
      isApproved: true,
    });

    console.log(`✅ Claims définis pour UID: ${uid}, Rôle: ${role}`);
    res.status(200).json({ success: true, message: "Claims ajoutés avec succès." });

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des claims :", error);
    res.status(500).json({ success: false, message: "Erreur interne lors de l'ajout des claims." });
  }
};
