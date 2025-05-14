require("dotenv").config();
console.log("📦 Chargement firebaseAdmin.js...");

const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    console.log("📁 Utilisation de la clé via env FIREBASE_SERVICE_ACCOUNT_BASE64");
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
    serviceAccount = JSON.parse(decoded);
  } else {
    throw new Error("Aucune variable FIREBASE_SERVICE_ACCOUNT_BASE64 trouvée.");
  }
} catch (err) {
  console.error("❌ Erreur de chargement des identifiants Firebase :", err.message);
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
let storage = null;

try {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error("FIREBASE_STORAGE_BUCKET manquant");
  storage = getStorage().bucket(bucketName);
  console.log(`✅ Bucket Firebase Storage initialisé : ${bucketName}`);
} catch (err) {
  console.error("❌ Erreur accès au bucket Firebase :", err.message);
}

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

const uploadFileToStorage = async (file) => {
  try {
    if (!file || !storage) throw new Error("Stockage Firebase non disponible ou fichier manquant.");
    const fileName = `documents/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);
    await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });
    await fileUpload.makePublic();
    return `https://storage.googleapis.com/${storage.name}/${fileName}`;
  } catch (error) {
    throw new Error("❌ Upload échoué : " + error.message);
  }
};

module.exports = { admin, db, storage, verifyToken, uploadFileToStorage };
