require("dotenv").config();

const express = require("express");
const path = require("path");

const { admin, db } = require("./config/firebaseAdmin");
const verifyToken = require("./middlewares/verifyToken");

// ✅ Import des routes
const dossierRoutes = require("./routes/dossiers");
const ordersRoutes = require("./routes/orders");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const declarationRoutes = require("./routes/declarationRoutes");
const generateRoutes = require("./routes/generate");
const userRoutes = require("./routes/users");
const customClaimsRoutes = require("./routes/customClaims");
const notificationsRoutes = require("./routes/notifications");

const app = express();

console.log("🚀 Server init...");

// ✅ CORS manuel – prise en charge complète pour Render
const allowedOrigins = [
  "https://www.veryfit.fr",
  "http://localhost:3000",
  "https://veryfit.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger simple
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Route de test CORS (à placer avant les routes dynamiques)
app.get("/test-cors", (req, res) => {
  res.json({ message: "✅ CORS OK depuis Render" });
});

// ✅ Routes API
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/custom-claims", customClaimsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/", uploadRoutes);

// ✅ Fichiers statiques pour les PDF
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
