const express = require("express");
const documentController = require("../controllers/documentController");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Vérifier que toutes les routes ont bien une fonction définie
if (!documentController.getDocumentsByRole) 
if (!documentController.getDocumentsByCategory) 
if (!documentController.updateDocument) 
if (!documentController.signAndUploadPDF) 

// Routes de gestion des documents
router.get("/role/:role", documentController.getDocumentsByRole);
router.get("/category/:category", documentController.getDocumentsByCategory);
router.put("/:id", documentController.updateDocument);
router.delete("/:id", documentController.deleteDocument);

// ✅ Route pour l'upload de signature PDF avec Multer
router.post("/sign-upload", upload.single("file"), documentController.signAndUploadPDF);

module.exports = router;
