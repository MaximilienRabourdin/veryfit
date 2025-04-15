const express = require("express");
const admin = require("../config/firebaseAdmin");
const db = admin.firestore();
const router = express.Router();

// Inscription d'un revendeur
router.post("/create-account", async (req, res) => {
  const { email, password, role, company } = req.body;

  if (!email || !password || !role || !company) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  try {
    // Vérifie si le revendeur existe dans Firestore
    const revendeurSnapshot = await db
      .collection("revendeurs")
      .where("Email", "==", email)
      .get();

    if (revendeurSnapshot.empty) {
      return res.status(404).json({ message: "Aucun revendeur trouvé avec cet email." });
    }

    // Crée l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Définit les revendications personnalisées (Custom Claims)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, isApproved: false });

    // Met à jour le document Firestore
    const revendeurDoc = revendeurSnapshot.docs[0];
    await revendeurDoc.ref.update({ isApproved: false, createdAt: new Date().toISOString() });

    res.status(201).json({ message: "Compte revendeur créé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la création du compte :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

module.exports = router;
