const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebaseAdmin");

router.post("/setCustomClaims", async (req, res) => {
  const { uid, role, isApproved } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "uid et role sont requis" });
  }

  try {
    const normalizedRole = role.toLowerCase();

    // 🔐 1. Set les custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: normalizedRole,
      isApproved: !!isApproved,
    });

    // 🗃️ 2. Firestore update (merge)
    await db.collection("users_webapp").doc(uid).set({
      role: normalizedRole,
      isApproved: true,
    }, { merge: true });

    // ✅ 3. Vérification immédiate des claims
    const user = await admin.auth().getUser(uid);
    console.log("✅ Claims actuels : ", user.customClaims);

    return res.status(200).json({ message: "Claims mis à jour." });
  } catch (error) {
    console.error("❌ Erreur setCustomClaims:", error);
    return res.status(500).json({ error: "Erreur serveur claims." });
  }
});

module.exports = router;
