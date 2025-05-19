// routes/customClaims.js

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { db } = require("../config/firebaseAdmin");

router.post("/setCustomClaims", async (req, res) => {
  const { uid, role, isApproved } = req.body;

  if (!uid || !role) return res.status(400).json({ error: "uid et role sont requis" });

  try {
    const normalizedRole = role.toLowerCase();
    await admin.auth().setCustomUserClaims(uid, {
      role: normalizedRole,
      isApproved: isApproved === true,
    });

    await db.collection("users_webapp").doc(uid).set(
      { role: normalizedRole, isApproved: true },
      { merge: true }
    );

    return res.status(200).json({ message: "✅ Custom claims définis avec succès." });
  } catch (error) {
    console.error("❌ Erreur dans setCustomClaims :", error);
    return res.status(500).json({ error: "Erreur serveur lors de la définition des custom claims." });
  }
});

module.exports = router;
