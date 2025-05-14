const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

router.post("/setCustomClaims", async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "UID et rôle sont requis." });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role, isApproved: true });
    res.status(200).json({ message: "✅ Custom Claims définis avec succès." });
  } catch (error) {
    
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
