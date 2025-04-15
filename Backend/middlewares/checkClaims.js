const admin = require("../config/firebaseAdmin"); // Utilisez le fichier centralisé.

const checkClaims = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant ou invalide." });
  }

  const token = authorization.split(" ")[1]; // Extraire le token après "Bearer "

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token décodé avec succès :", decodedToken); // Ajoutez un log pour déboguer
    req.user = decodedToken; // Ajoutez les claims au `req.user`
    next();
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token :", error.message);
    res.status(401).json({ success: false, message: "Token invalide." });
  }
};

module.exports = { checkClaims };
