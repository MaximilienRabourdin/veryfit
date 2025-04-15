const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");

// ✅ Vérification pour éviter une double initialisation
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require(path.join(__dirname, "firebase-service-key.json"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "fitdoorswebapp-79538.appspot.com",
    });

    console.log("✅ Firebase Admin initialisé !");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin :", error);
    process.exit(1);
  }
}

// ✅ Initialisation des services
const db = admin.firestore();
const storage = getStorage().bucket(); // ✅ Bucket Firebase Storage

// 🔹 Middleware pour vérifier les tokens Firebase
const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.warn("⚠ Token manquant ou mal formé !");
    return res.status(401).json({
      success: false,
      message: "Token manquant ou mal formé.",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token vérifié :", decodedToken);

    if (!decodedToken.role) {
      console.warn("⚠ Aucun rôle défini dans les claims Firebase !");
      return res.status(403).json({
        success: false,
        message: "Accès refusé : rôle manquant.",
      });
    }

    req.user = decodedToken; // Ajoute les infos utilisateur à la requête
    next();
  } catch (error) {
    console.error("❌ Erreur de vérification du token :", error.message);
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
    });
  }
};

// 🔹 Fonction pour uploader un fichier sur Firebase Storage
const uploadFileToStorage = async (file) => {
  try {
    if (!file) throw new Error("Aucun fichier fourni.");

    const fileName = `documents/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);

    // 🔥 Sauvegarde du fichier sur Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // 🔹 Rendre le fichier public pour qu'il soit accessible
    await fileUpload.makePublic();

    const fileUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`;
    console.log("✅ Fichier uploadé :", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("❌ Erreur lors de l'upload du fichier :", error);
    throw new Error("Impossible d'uploader le fichier.");
  }
};

// ✅ Exportation des services
module.exports = { admin, db, storage, verifyToken, uploadFileToStorage };
