const express = require("express");
const { getOrderById, getRevendeurOrders } = require("../controllers/ordersController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// ✅ Vérification du rôle AVANT d'accéder aux commandes
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    console.log("🛠 Vérification du rôle utilisateur :", req.user);

    if (!req.user || req.user.role.toLowerCase() !== "revendeur") {
      console.warn("❌ Accès refusé : rôle incorrect !");
      return res.status(403).json({ success: false, message: "Accès refusé : rôle incorrect." });
    }

    console.log("✅ Rôle validé. Récupération des commandes...");
    
    // 🔥 Vérifie l'ID utilisateur avant d'exécuter la requête
    if (!req.user.uid) {
      console.error("❌ UID manquant dans le token !");
      return res.status(400).json({ success: false, message: "UID utilisateur introuvable." });
    }

    const orders = await getRevendeurOrders(req.user.uid);

    if (!orders) {
      console.warn("⚠ Aucun ordre trouvé !");
      return res.status(404).json({ success: false, message: "Aucune commande trouvée." });
    }

    console.log("✅ Commandes récupérées :", orders);
    res.status(200).json({ success: true, orders });

  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


module.exports = router;
