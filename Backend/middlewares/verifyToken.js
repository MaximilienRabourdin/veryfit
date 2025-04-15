const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant ou mal formé." });
  }

  const token = authorization.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token vérifié :", decodedToken);

    // 🔥 Ajoute un log pour voir le rôle récupéré
    console.log("🎯 Rôle détecté dans le token :", decodedToken.role);

    if (!decodedToken.role) {
      console.warn("⚠ Aucun rôle défini pour l'utilisateur !");
      return res.status(403).json({ success: false, message: "Accès refusé : rôle manquant." });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Erreur de vérification du token :", error.message);
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};


module.exports = verifyToken;
