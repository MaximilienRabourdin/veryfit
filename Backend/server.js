require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { admin, db } = require("./config/firebaseAdmin");
const verifyToken = require("./middlewares/verifyToken");

const dossierRoutes = require("./routes/dossiers");
const ordersRoutes = require("./routes/orders");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const declarationRoutes = require("./routes/declarationRoutes");
const notificationsRoutes = require("./routes/notifications");
const generateRoutes = require("./routes/generate");
const userRoutes = require("./routes/users");
const customClaimsRoutes = require("./routes/customClaims");

const app = express();

console.log("🚀 Server init...");

// ✅ Middleware CORS
app.use(cors({
  origin: ["https://www.veryfit.fr", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger (optionnel)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ Routes protégées et publiques
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/custom-claims", customClaimsRoutes);

// ✅ Uploads (PDF statiques)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes de base (upload, autres)
app.use("/", uploadRoutes);

// ✅ 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
