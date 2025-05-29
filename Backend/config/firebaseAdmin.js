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
    
    // Vérifications de sécurité
    console.log("✅ Service account décodé avec succès");
    console.log("🔑 Project ID:", serviceAccount.project_id);
    console.log("📧 Client email:", serviceAccount.client_email);
    console.log("🔐 Private key présente:", !!serviceAccount.private_key);
    
  } else {
    throw new Error("Aucune variable FIREBASE_SERVICE_ACCOUNT_BASE64 trouvée.");
  }
} catch (err) {
  console.error("❌ Erreur de chargement des identifiants Firebase :", err.message);
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    console.log("🚀 Initialisation Firebase Admin...");
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id, // Ajout explicite
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    
    console.log("✅ Firebase Admin initialisé avec succès");
    
    // Test de connexion Firestore
    const db = admin.firestore();
    console.log("🔥 Firestore connecté");
    
    // Test rapide d'authentification
    setTimeout(async () => {
      try {
        console.log("🧪 Test de connexion Firestore...");
        const testRef = db.collection('test').doc('connection-test');
        await testRef.set({ 
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          test: true 
        });
        console.log("✅ Test Firestore réussi - authentification OK");
        
        // Nettoyage du test
        await testRef.delete();
        
      } catch (testError) {
        console.error("❌ Test Firestore échoué:", testError.message);
        console.error("❌ Vérifiez les permissions de votre service account");
      }
    }, 2000); // Test après 2 secondes
    
  } catch (err) {
    console.error("❌ Erreur d'initialisation Firebase :", err);
    console.error("❌ Détails:", err.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// Configuration Firestore pour éviter les erreurs de connexion
db.settings({
  ignoreUndefinedProperties: true,
});

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
    console.error("❌ Erreur vérification token:", err.message);
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};

const uploadFileToStorage = async (file) => {
  try {
    if (!file || !storage) throw new Error("Stockage Firebase non disponible ou fichier manquant.");
    
    const fileName = `documents/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);
    
    await fileUpload.save(file.buffer, { 
      metadata: { 
        contentType: file.mimetype 
      } 
    });
    
    await fileUpload.makePublic();
    return `https://storage.googleapis.com/${storage.name}/${fileName}`;
  } catch (error) {
    console.error("❌ Upload échoué:", error);
    throw new Error("❌ Upload échoué : " + error.message);
  }
};

// Fonction de test pour diagnostiquer les problèmes
const testFirebaseConnection = async () => {
  try {
    console.log("🔍 Test complet Firebase...");
    
    // Test 1: Firestore
    const testDoc = await db.collection('test').doc('diagnostic').set({
      timestamp: new Date(),
      test: 'connection'
    });
    console.log("✅ Test Firestore: OK");
    
    // Test 2: Auth (liste des utilisateurs)
    const listUsers = await admin.auth().listUsers(1);
    console.log("✅ Test Auth: OK");
    
    // Nettoyage
    await db.collection('test').doc('diagnostic').delete();
    
    return { success: true, message: "Tous les tests Firebase réussis" };
  } catch (error) {
    console.error("❌ Test Firebase échoué:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  admin,
  db,
  storage,
  verifyToken,
  uploadFileToStorage,
  testFirebaseConnection, // Pour diagnostics
};