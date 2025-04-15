const admin = require("firebase-admin");

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    const userToken = req.headers.authorization?.split("Bearer ")[1];

    if (!userToken) {
      return res.status(403).json({ success: false, message: "Accès refusé : Token manquant." });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(userToken);
      const userRole = decodedToken.role;

      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: "Accès refusé : Rôle insuffisant." });
      }

      next(); // Accès autorisé
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle :", error);
      return res.status(403).json({ success: false, message: "Accès refusé : Erreur de vérification." });
    }
  };
};

module.exports = checkRole;
