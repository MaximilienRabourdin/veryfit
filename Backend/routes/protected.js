const express = require("express");
const verifyToken = require("../middlewares/verifyToken"); // Middleware pour vérifier le token

const router = express.Router();

// Route protégée pour vérifier l'accès avec un token valide
router.get("/", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bienvenue sur la route protégée.",
    user: req.user, // Utilisateur attaché par verifyToken
  });
});

// Route pour récupérer les informations utilisateur à partir des revendications personnalisées
router.get("/user-info", verifyToken, (req, res) => {
  try {
    const { role, isApproved, email, uid } = req.user;

    if (!role || isApproved === undefined) {
      return res.status(403).json({
        success: false,
        message: "Rôle ou approbation manquants.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        role,
        isApproved,
        email,
        userId: uid,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des informations utilisateur :", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
});

module.exports = router;
