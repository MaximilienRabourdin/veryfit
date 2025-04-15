const express = require("express");
const multer = require("multer");
const { db } = require("../config/firebaseAdmin");
const { sendEmailToDestinataire } = require("../utils/email");
const { uploadNotice } = require("../utils/uploadNotice");
const {
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  createDossier,
  updateDocumentStatus,
  sendNotificationToFit, // ✅ Importé ici si besoin
} = require("../controllers/dossierController");

const router = express.Router();
const upload = multer(); // mémoire

// 🔹 Création de dossier CE avec envoi d'email et fichier éventuel
router.post("/create", upload.single("file"), async (req, res) => {
  

  try {
    const rawData = req.body.data;
    if (!rawData) return res.status(400).json({ error: "Données manquantes" });

    const dossierData = JSON.parse(rawData);
    if (!dossierData.id) return res.status(400).json({ error: "ID manquant" });

    let declarationCE = null;
    if (req.file && req.file.buffer) {
      const fileUrl = await uploadNotice(req.file);
      declarationCE = {
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        url: fileUrl,
      };
    }

    const finalData = {
      ...dossierData,
      ...(declarationCE && { declarationCE }),
      createdAt: new Date(),
    };

    await db.collection("dossiers").doc(dossierData.id).set(finalData);

    if (dossierData.revendeurEmail) {
      await sendEmailToDestinataire({
        to: dossierData.revendeurEmail,
        dossierId: dossierData.id,
        orderName: dossierData.orderName,
        deliveryDate: dossierData.deliveryDate,
        produits: dossierData.produits,
      });
    }

    return res.status(201).json({ success: true, dossierId: dossierData.id });
  } catch (error) {
    
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// 🔹 Génération déclaration CE PDF par produit
router.get("/generate/declaration-ce/:dossierId/:productId", generateDeclarationCEForProduct);

// 🔹 Génération déclaration de montage PDF par produit
router.get("/generate/declaration-montage/:dossierId/:productId", generateDeclarationMontageForProduct);

// 🔹 MAJ statut d’un document d’un produit
router.post("/update-document", updateDocumentStatus);

module.exports = router;
