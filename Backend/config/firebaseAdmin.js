require("dotenv").config();
console.log("📦 Chargement firebaseAdmin.js...");

const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n')); // échappement pour Railway
    console.log("🌍 Utilisation des identifiants via .env");
  } else {
    console.log("📁 Utilisation du fichier JSON local");
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
  } catch (err) {
    console.error("❌ Erreur d'initialisation Firebase :", err);
    process.exit(1);
  }
}

const db = admin.firestore();

// 🔐 Initialisation Firebase Storage
let bucket, storage;

try {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error("FIREBASE_STORAGE_BUCKET manquant dans .env");

  bucket = admin.storage().bucket(bucketName);
  storage = getStorage().bucket(bucketName);
  console.log(`✅ Bucket Firebase Storage initialisé : ${bucketName}`);
} catch (err) {
  console.error("❌ Erreur lors de l'accès au bucket Firebase Storage :", err.message);
  bucket = null;
  storage = null;
}

// 🔐 Middleware de vérification de token Firebase
const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant ou mal formé." });
  }

  const token = authorization.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.role) {
      return res.status(403).json({ success: false, message: "Accès refusé : rôle manquant." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};

// 📤 Fonction d'upload vers Firebase Storage
const uploadFileToStorage = async (file) => {
  try {
    if (!file || !storage) throw new Error("Stockage Firebase non disponible ou fichier manquant.");
    const fileName = `documents/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);
    await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });
    await fileUpload.makePublic();
    return `https://storage.googleapis.com/${storage.name}/${fileName}`;
  } catch (error) {
    throw new Error("❌ Impossible d'uploader le fichier : " + error.message);
  }
};

module.exports = { admin, db, bucket, storage, verifyToken, uploadFileToStorage };
