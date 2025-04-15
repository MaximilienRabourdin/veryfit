const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

// ✅ Route pour créer un compte
router.post("/", (req, res) => {
  console.log("📩 Requête reçue :", req.body);
  res.json({ success: true, message: "Compte créé avec succès !" });
});


// ✅ Import correct des fonctions depuis userController.js
const userController = require("../controllers/userController");

console.log("✅ Fonctions importées depuis userController :", userController);

// ✅ Vérification si les fonctions sont bien définies
if (!userController || !userController.getUserClaims || !userController.setCustomClaims) {
  throw new Error("❌ Erreur : `setCustomClaims` ou `getUserClaims` n'est pas défini !");
}

// ✅ Route pour définir les Custom Claims
router.post("/setCustomClaims", userController.setCustomClaims);

// ✅ Route pour récupérer les Custom Claims d'un utilisateur
router.get("/getUserClaims", verifyToken, userController.getUserClaims);

module.exports = router;
