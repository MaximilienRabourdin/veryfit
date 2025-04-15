const express = require("express");
const { getOrderById, getRevendeurOrders } = require("../controllers/ordersController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// ✅ Vérification du rôle AVANT d'accéder aux commandes
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    

    if (!req.user || req.user.role.toLowerCase() !== "revendeur") {
      
      return res.status(403).json({ success: false, message: "Accès refusé : rôle incorrect." });
    }

    
    
    // 🔥 Vérifie l'ID utilisateur avant d'exécuter la requête
    if (!req.user.uid) {
      
      return res.status(400).json({ success: false, message: "UID utilisateur introuvable." });
    }

    const orders = await getRevendeurOrders(req.user.uid);

    if (!orders) {
      
      return res.status(404).json({ success: false, message: "Aucune commande trouvée." });
    }

    
    res.status(200).json({ success: true, orders });

  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


module.exports = router;
