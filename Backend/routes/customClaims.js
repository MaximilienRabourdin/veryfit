const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebaseAdmin");
const cors = require("cors");

// Configuration CORS spécifique pour ces routes sensibles
const corsOptions = {
  origin: "*", // Autoriser toutes les origines
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400
};

// Middleware CORS spécifique à ces routes
router.use(cors(corsOptions));

// Middleware pour les requêtes OPTIONS (préflight)
router.options("*", (req, res) => {
  console.log("🔄 OPTIONS préflight sur customClaims");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// 🔹 SET custom claims + mise à jour Firestore
router.post("/setCustomClaims", async (req, res) => {
  console.log("📌 Requête reçue sur /setCustomClaims");
  console.log("📦 Body reçu:", req.body);

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