const admin = require("firebase-admin");

// ✅ Initialisation de Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const admin = require("firebase-admin");

// Assure-toi que `admin` est bien initialisé dans ton projet (tu l’as déjà fait)

const assignCustomClaims = async (uid, role) => {
  try {
    await admin.auth().setCustomUserClaims(uid, {
      role,
      isApproved: true, // ou false si besoin d'une validation manuelle
    });

    console.log(`✅ Rôle "${role}" assigné à l’utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ Erreur lors de l’assignation des custom claims :", error);
  }
};


// ✅ Fonction pour récupérer les Custom Claims d'un utilisateur
const getUserClaims = async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);

    res.status(200).json({
      success: true,
      message: "✅ Récupération des Custom Claims réussie.",
      claims: user.customClaims || {},
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des claims :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ Fonction pour définir les Custom Claims
const setCustomClaims = async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "UID et rôle sont requis." });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, {
      role,
      isApproved: true,
    });

    res.status(200).json({ message: "✅ Custom Claims définis avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de la définition des Custom Claims :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ Vérification avant exportation
console.log("✅ userController exporte :", { setCustomClaims, getUserClaims });

module.exports = { setCustomClaims, getUserClaims };
