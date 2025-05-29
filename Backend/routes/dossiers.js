const express = require("express");
const multer = require("multer");
const { db } = require("../config/firebaseAdmin");
const { sendEmailToDestinataire } = require("../utils/email");
const {
  createDossier,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  updateDocumentStatus,
  generateDeclarationMontageCarrossier
} = require("../controllers/dossierController");

const { generateControlePeriodiquePDF } = require("../controllers/generateControlePeriodiquePDF");

const router = express.Router();

// Utilisation de multer avec upload en mémoire
const upload = multer();
const champsAcceptes = Array.from({ length: 50 }, (_, i) => ({ name: `file_produit_${i}` }));

// 🔹 Route création de dossier CE avec debug complet
router.post("/create", upload.fields(champsAcceptes), async (req, res) => {
  try {
    console.log("🔍 Début création dossier");
    console.log("📦 req.body keys:", Object.keys(req.body));
    console.log("📁 req.files keys:", Object.keys(req.files || {}));

    const rawData = req.body.data;
    if (!rawData) {
      console.error("❌ Données manquantes dans req.body.data");
      return res.status(400).json({ error: "Données manquantes" });
    }

    console.log("📝 Raw data reçue (preview):", rawData.substring(0, 200) + "...");

    let dossierData;
    try {
      dossierData = JSON.parse(rawData);
      console.log("✅ JSON parsé avec succès");
      console.log("🆔 ID dossier:", dossierData.id);
      console.log("📧 Email destinataire:", dossierData.revendeurEmail);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError);
      return res.status(400).json({ error: "Format JSON invalide", details: parseError.message });
    }

    if (!dossierData.id) {
      console.error("❌ ID manquant dans les données");
      return res.status(400).json({ error: "ID manquant" });
    }

    console.log("📁 Traitement des fichiers...");
    const fichiersProduits = {};
    Object.entries(req.files || {}).forEach(([fieldname, files]) => {
      const file = files[0];
      if (file && file.buffer) {
        fichiersProduits[fieldname] = {
          name: file.originalname,
          mimetype: file.mimetype,
          buffer: file.buffer,
        };
        console.log(`📎 Fichier traité: ${fieldname} -> ${file.originalname}`);
      }
    });

    console.log("🔧 Préparation des données finales...");
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

    console.log("💾 Sauvegarde dans Firestore...");
    try {
      await db.collection("dossiers").doc(dossierData.id).set(finalData);
      console.log("✅ Sauvegarde Firestore réussie");
    } catch (firestoreError) {
      console.error("❌ Erreur Firestore:", firestoreError);
      throw new Error(`Erreur Firestore: ${firestoreError.message}`);
    }

    // Envoi email avec gestion d'erreur séparée
    if (dossierData.revendeurEmail) {
      console.log("📧 Envoi email à:", dossierData.revendeurEmail);
      const emailResult = await sendEmailToDestinataire({
        to: dossierData.revendeurEmail,
        dossierId: dossierData.id,
        orderName: dossierData.orderName,
        deliveryDate: dossierData.deliveryDate,
        produits: dossierData.produits,
        fichiers: fichiersProduits,
      });
      
      if (emailResult.success) {
        console.log("✅ Email envoyé avec succès");
      } else {
        console.log("⚠️ Email non envoyé:", emailResult.reason || emailResult.error);
      }
    } else {
      console.log("📧 Pas d'email à envoyer (revendeurEmail vide)");
    }

    console.log("🎉 Création dossier terminée avec succès");
    return res.status(201).json({ success: true, dossierId: dossierData.id });

  } catch (error) {
    console.error("🚨 Erreur création dossier :", error);
    console.error("🚨 Stack trace:", error.stack);
    return res.status(500).json({ 
      error: "Erreur serveur", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 🔹 Routes : génération des PDF
router.get("/generate/declaration-ce/:dossierId/:productId", generateDeclarationCEForProduct);
router.get('/generate/declaration-montage/:dossierId/:productId', generateDeclarationMontageForProduct);
router.get('/generate/declaration-montage-carrossier/:dossierId', generateDeclarationMontageCarrossier);

router.post("/controle-periodique/generate/:dossierId/:produitId", generateControlePeriodiquePDF);

// 🔹 Route : mise à jour d'un document spécifique
router.post("/update-document", updateDocumentStatus);

module.exports = router;