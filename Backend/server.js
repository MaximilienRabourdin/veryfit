require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// =============================================
// SOLUTION CORS ULTIME - MIDDLEWARE PRIORITAIRE
// =============================================
console.log('⚠️ SOLUTION CORS ULTIME ACTIVÉE');
app.use(function(req, res, next) {
  // Autorise TOUTES les origines sans exception
  res.header("Access-Control-Allow-Origin", "*");
  // Autorise tous les en-têtes
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // Autorise toutes les méthodes
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // Permet d'inclure les cookies
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Gestion spéciale des requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    console.log('🔍 Requête OPTIONS interceptée pour:', req.originalUrl);
    return res.status(200).send();
  }
  
  next();
});

// Middleware OPTIONS spécifique pour la route problématique
app.options('/api/custom-claims/setCustomClaims', (req, res) => {
  console.log('🚨 OPTIONS spécifique pour /api/custom-claims/setCustomClaims');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.sendStatus(200);
});

// Important! N'importer que depuis firebaseAdmin.js, qui importe déjà firebase.config.js
const { admin, db, storage, verifyToken } = require("./config/firebaseAdmin");

// Importer les routes
const dossierRoutes = require("./routes/dossiers");
const ordersRoutes = require("./routes/orders");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const declarationRoutes = require("./routes/declarationRoutes");
const generateRoutes = require("./routes/generate");
const userRoutes = require("./routes/users");
const customClaimsRoutes = require("./routes/customClaims");
const notificationsRoutes = require("./routes/notifications");

// Configuration CORS standard (désactivée car nous utilisons la solution d'urgence)
/*
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400, // 24 heures
  })
);
*/

// Route de test CORS spécifique
app.get("/api/test", (req, res) => {
  console.log("🧪 Test CORS endpoint hit");
  res.json({
    message: "API fonctionne correctement avec CORS",
    timestamp: new Date().toISOString(),
  });
});

// Route spécifique pour tester les claims
app.get("/api/custom-claims/getClaims/:uid", (req, res) => {
  const uid = req.params.uid;
  console.log(`🔍 Récupération des claims pour l'utilisateur: ${uid}`);

  // Pour le test, renvoyer un objet factice
  res.json({
    role: "user",
    permissions: ["read"],
    timestamp: new Date().toISOString(),
  });
});

// Middlewares essentiels
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/custom-claims", customClaimsRoutes); // sans token

// Uploads publics
app.use("/", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);
  res.status(500).json({
    success: false,
    message: "Erreur serveur",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Une erreur est survenue",
  });
});

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});