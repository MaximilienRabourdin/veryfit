const express = require("express");
const multer = require("multer");
const { db } = require("../config/firebaseAdmin");
const { sendEmailToDestinataire } = require("../utils/email");
const {
  createDossier,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  updateDocumentStatus,
} = require("../controllers/dossierController");

const router = express.Router();

// Utilisation de multer avec upload en mémoire
const upload = multer();
const champsAcceptes = Array.from({ length: 50 }, (_, i) => ({ name: `file_produit_${i}` }));

// 🔹 Route création de dossier CE
router.post("/create", upload.fields(champsAcceptes), async (req, res) => {
  try {
    const rawData = req.body.data;
    if (!rawData) return res.status(400).json({ error: "Données manquantes" });

    const dossierData = JSON.parse(rawData);
    if (!dossierData.id) return res.status(400).json({ error: "ID manquant" });

    const fichiersProduits = {};
    Object.entries(req.files || {}).forEach(([fieldname, files]) => {
      const file = files[0];
      fichiersProduits[fieldname] = {
        name: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
      };
    });

    const finalData = {
      ...dossierData,
      createdAt: new Date(),
      fichiersMeta: Object.fromEntries(
        Object.entries(fichiersProduits).map(([key, val]) => [
          key,
          { name: val.name, mimetype: val.mimetype },
        ])
      ),
    };

    await db.collection("dossiers").doc(dossierData.id).set(finalData);

    if (dossierData.revendeurEmail) {
      await sendEmailToDestinataire({
        to: dossierData.revendeurEmail,
        dossierId: dossierData.id,
        orderName: dossierData.orderName,
        deliveryDate: dossierData.deliveryDate,
        produits: dossierData.produits,
        fichiers: fichiersProduits,
      });
    }

    return res.status(201).json({ success: true, dossierId: dossierData.id });
  } catch (error) {
    console.error("🚨 Erreur création dossier :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// 🔹 Routes : génération des PDF
router.get("/generate/declaration-ce/:dossierId/:productId", generateDeclarationCEForProduct);
router.get('/generate/declaration-montage/:dossierId/:productId', generateDeclarationMontageForProduct);

// 🔹 Route : mise à jour d’un document spécifique
router.post("/update-document", updateDocumentStatus);

module.exports = router;
