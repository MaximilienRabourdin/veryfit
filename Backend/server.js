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

console.log("🚀 Server init...");
console.log("🧪 Debug: version Render active");

// ✅ Middleware CORS propre
const allowedOrigins = [
  "https://www.veryfit.fr",
  "http://localhost:3000",
  "https://veryfit.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware parsing & logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Test CORS route
app.get("/test-cors", (req, res) => {
  console.log("✅ Requête test-cors reçue");
  res.json({ message: "✅ CORS OK depuis Render" });
});

// ✅ Routes API
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/custom-claims", verifyToken, customClaimsRoutes);
app.use("/", uploadRoutes);

// ✅ Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
