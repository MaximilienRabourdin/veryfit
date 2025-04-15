const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

router.post("/setCustomClaims", async (req, res) => {
  const { uid, role, isApproved } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "uid et role sont requis" });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, {
      role,
      isApproved: isApproved === true,
    });

    console.log(`✅ Custom claims définis pour UID ${uid} :`, { role, isApproved });

    return res.status(200).json({ message: "Custom claims mis à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur setCustomClaims :", error);
    return res.status(500).json({ error: "Erreur serveur lors de la définition des custom claims." });
  }
});

module.exports = router;
