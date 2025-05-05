require("dotenv").config(); // 🔥 important pour charger les variables .env
console.log("📦 Chargement firebaseAdmin.js...");

const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("🌍 Utilisation de FIREBASE_SERVICE_ACCOUNT depuis .env");

    // 🔐 Correction du \n
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(raw);
  } else {
    console.log("📁 Utilisation du fichier firebase-service-key.json");
    serviceAccount = require(path.join(__dirname, "firebase-service-key.json"));
  }
} catch (err) {
  console.error("❌ Erreur de chargement des identifiants Firebase :", err);
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log("✅ Firebase initialisé");
  } catch (error) {
    console.error("❌ Erreur d'initialisation Firebase :", error);
    process.exit(1);
  }
}

const db = admin.firestore();
const storage = getStorage().bucket();

// 🔹 Middleware pour vérifier les tokens Firebase
const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant ou mal formé." });
  }

  const token = authorization.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role) {
      return res.status(403).json({ success: false, message: "Accès refusé : rôle manquant." });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};

// 🔹 Fonction pour uploader un fichier sur Firebase Storage
const uploadFileToStorage = async (file) => {
  try {
    if (!file) throw new Error("Aucun fichier fourni.");
    const fileName = `documents/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);
    await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });
    await fileUpload.makePublic();
    return `https://storage.googleapis.com/${storage.name}/${fileName}`;
  } catch (error) {
    throw new Error("Impossible d'uploader le fichier.");
  }
};

module.exports = { admin, db, storage, verifyToken, uploadFileToStorage };
