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

// ✅ CORS setup - ne pas doubler avec un autre middleware CORS !
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.veryfit.fr",
  "https://veryfit.onrender.com", // à retirer si non utile
  "null" // ← AJOUTE CETTE LIGNE

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

// ✅ Middlewares essentiels
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger simple
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use("/api/orders", verifyToken, ordersRoutes); // protégée
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/custom-claims", customClaimsRoutes); // sans token

// ✅ Uploads publics
app.use("/", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔻 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
