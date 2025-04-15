const express = require("express");
const documentController = require("../controllers/documentController");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Vérifier que toutes les routes ont bien une fonction définie
if (!documentController.getDocumentsByRole) console.error("🚨 ERREUR: getDocumentsByRole n'est pas défini !");
if (!documentController.getDocumentsByCategory) console.error("🚨 ERREUR: getDocumentsByCategory n'est pas défini !");
if (!documentController.updateDocument) console.error("🚨 ERREUR: updateDocument n'est pas défini !");
if (!documentController.signAndUploadPDF) console.error("🚨 ERREUR: signAndUploadPDF n'est pas défini !");

// Routes de gestion des documents
router.get("/role/:role", documentController.getDocumentsByRole);
router.get("/category/:category", documentController.getDocumentsByCategory);
router.put("/:id", documentController.updateDocument);
router.delete("/:id", documentController.deleteDocument);

// ✅ Route pour l'upload de signature PDF avec Multer
router.post("/sign-upload", upload.single("file"), documentController.signAndUploadPDF);

module.exports = router;
