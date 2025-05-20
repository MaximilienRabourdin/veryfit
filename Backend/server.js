require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// ⚠️ SOLUTION D'URGENCE CORS - Ajouter ce middleware en premier
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
console.log('⚠️ CORS BYPASS ACTIVÉ - TOUTES LES ORIGINES SONT AUTORISÉES');

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

// CORS setup - Configuration normale
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
  "https://www.veryfit.fr",
  "https://veryfit.onrender.com",
  "https://veryfit-frontend.onrender.com",
  "null",
];

// Configuration CORS principale
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Requête entrante depuis :", origin);
      // Autoriser les requêtes sans origine (comme Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("⛔ CORS refusé pour :", origin);
        // En développement ou sur Render, autoriser toutes les origines
        if (
          process.env.NODE_ENV === "development" ||
          process.env.ALLOW_ALL_ORIGINS === "true"
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400, // 24 heures
  })
);

// Réponse aux requêtes OPTIONS (très important)
app.options("*", (req, res) => {
  console.log("🌐 Global OPTIONS handler hit");
  res.sendStatus(204);
});

// Route de test CORS spécifique
app.get("/api/test", (req, res) => {
  console.log("🧪 Test CORS endpoint hit");
  res.json({
    message: "API fonctionne correctement avec CORS",
    timestamp: new Date().toISOString(),
  });
});

// Route spécifique pour le problème que vous rencontrez
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

// Middlewares essentiels - APRÈS CORS, mais AVANT les routes
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