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

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger
app.use((req, res, next) => {
  next();
});

// ✅ Routes API
app.use("/api/orders", verifyToken, ordersRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/declaration", declarationRoutes);
app.use("/", uploadRoutes);

// ✅ Dossier statique pour les PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const customClaimsRoutes = require("./routes/customClaims");
app.use("/api/custom-claims", customClaimsRoutes);


// ✅ 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});



// ✅ Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
});

