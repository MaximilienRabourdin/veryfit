require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const { admin, db } = require("./config/firebaseAdmin");
const verifyToken = require("./middlewares/verifyToken");

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

// 🔓 Middleware CORS brut pour Render
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

console.log("🚀 Server init...");

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.veryfit.fr",
  "https://veryfit.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Requête entrante depuis :", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("⛔ CORS refusé pour :", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger simple
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Routes protégées (avec token)
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationsRoutes);

// ⛔ Pas de token ici : claims ne sont pas encore présents
app.use("/api/custom-claims", customClaimsRoutes);

// ✅ Uploads publics
app.use("/", uploadRoutes);

// ✅ Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔻 Fallback route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Lancement
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
