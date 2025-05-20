const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebaseAdmin");

// CORS d'urgence spécifique pour ce routeur
router.use((req, res, next) => {
  console.log("🛠️ Middleware CORS customClaims pour:", req.path);
  
  // En-têtes CORS pour toutes les routes
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Traitement spécial des requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    console.log("🔄 OPTIONS dans customClaims pour:", req.path);
    return res.sendStatus(200);
  }
  
  next();
});

// Handler spécifique pour OPTIONS sur setCustomClaims
router.options("/setCustomClaims", (req, res) => {
  console.log("🔄 OPTIONS spécifique pour /setCustomClaims");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

// 🔹 SET custom claims + mise à jour Firestore
router.post("/setCustomClaims", async (req, res) => {
  console.log("📌 Requête reçue sur /setCustomClaims");
  console.log("📦 Body reçu:", req.body);
  console.log("📝 Headers:", req.headers);

  const { uid, role, isApproved } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "uid et role sont requis" });
  }

  try {
    const normalizedRole = role.toLowerCase();

    // 🔐 1. Set les custom claims test 
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

router.get("/getClaims/:uid", async (req, res) => {
  console.log("📌 Requête reçue sur /getClaims");
  const { uid } = req.params;

  try {
    const user = await admin.auth().getUser(uid);
    return res.status(200).json({
      success: true,
      uid: user.uid,
      customClaims: user.customClaims || {},
    });
  } catch (error) {
    console.error("❌ Erreur getClaims:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;