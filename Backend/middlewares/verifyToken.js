const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant ou mal formé." });
  }

  const token = authorization.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    

    // 🔥 Ajoute un log pour voir le rôle récupéré
    

    if (!decodedToken.role) {
      
      return res.status(403).json({ success: false, message: "Accès refusé : rôle manquant." });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};


module.exports = verifyToken;
