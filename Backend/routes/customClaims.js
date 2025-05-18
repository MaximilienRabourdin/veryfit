const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore(); // ✅ nécessaire pour écrire dans Firestore



router.get("/ping", (req, res) => {
  res.json({ message: "🟢 Custom claims route OK" });
});


router.post("/setCustomClaims", async (req, res) => {
  const { uid, role, isApproved } = req.body;

  console.log("📩 Requête reçue pour setCustomClaims :", { uid, role, isApproved });

  if (!uid || !role) {
    return res.status(400).json({ error: "uid et role sont requis" });
  }

  try {
    const normalizedRole = role.toLowerCase();
    console.log("➡️ Définition des claims pour", uid, "avec rôle", role);



    // ✅ 1. Définir les custom claims Firebase
    await admin.auth().setCustomUserClaims(uid, {
      role: normalizedRole,
      isApproved: isApproved === true,
    });
    console.log("✅ Custom claims définis :", normalizedRole);

    // ✅ 2. Mise à jour Firestore avec set + merge
    await db.collection("users_webapp").doc(uid).set(
      {
        role: normalizedRole,
        isApproved: true,
      },
      { merge: true }
    );
    console.log("✅ Firestore mis à jour avec rôle");

    return res.status(200).json({ message: "Custom claims mis à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur setCustomClaims :", error);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la définition des custom claims." });
  }
});

module.exports = router;
