const express = require("express");
const multer = require("multer");
const { db } = require("../config/firebaseAdmin");
const { sendEmailToDestinataire } = require("../utils/email");
const {
  createDossier,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  generateControlePeriodiqueForProduct, // 🔹 AJOUTÉ : Nouvelle fonction
  updateDocumentStatus,
  generateDeclarationMontageCarrossier,
  checkControlePeriodiqueAvailability, // 🔹 AJOUTÉ : Vérification disponibilité
} = require("../controllers/dossierController");

const { generateControlePeriodiquePDF } = require("../controllers/generateControlePeriodiquePDF");

const router = express.Router();

// Utilisation de multer avec upload en mémoire
const upload = multer();
const champsAcceptes = Array.from({ length: 50 }, (_, i) => ({ name: `file_produit_${i}` }));

// 🔹 MODIFIÉ : Route création de dossier CE utilisant le nouveau controller
router.post("/create", upload.fields(champsAcceptes), async (req, res) => {
  try {
    console.log("🔍 Début création dossier via nouveau controller");
    
    // Traitement des fichiers (garde votre logique existante)
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

    // 🔹 NOUVEAU : Utiliser le controller mis à jour avec contrôle périodique
    const result = await createDossier(req, res);
    
    // Note: Le controller gère déjà la réponse, mais on peut ajouter la logique des fichiers si nécessaire
    console.log("✅ Création dossier avec contrôle périodique terminée");
    
  } catch (error) {
    console.error("🚨 Erreur création dossier :", error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Erreur serveur", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// 🔹 NOUVEAU : Route pour vérifier la disponibilité du contrôle périodique
router.get("/check-controle-periodique/:dossierId/:productId", checkControlePeriodiqueAvailability);

// 🔹 Routes : génération des PDF
router.get("/generate/declaration-ce/:dossierId/:productId", generateDeclarationCEForProduct);
router.get('/generate/declaration-montage/:dossierId/:productId', generateDeclarationMontageForProduct);
router.get('/generate/declaration-montage-carrossier/:dossierId', generateDeclarationMontageCarrossier);

// 🔹 MODIFIÉ : Route contrôle périodique utilisant le nouveau controller
router.get("/generate/controle-periodique/:dossierId/:productId", generateControlePeriodiqueForProduct);

// 🔹 OPTIONNEL : Garder l'ancienne route pour compatibilité (à supprimer plus tard)
router.post("/controle-periodique/generate/:dossierId/:produitId", generateControlePeriodiquePDF);

// 🔹 Route : mise à jour d'un document spécifique
router.post("/update-document", updateDocumentStatus);

// 🔹 NOUVEAU : Route pour obtenir tous les dossiers (utile pour le calendrier FIT)
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = db.collection("dossiers");
    
    // Filtrer par type de destinataire si spécifié
    if (role && role !== 'fit') {
      query = query.where("destinataire_type", "==", role);
    }
    
    const snapshot = await query.get();
    const dossiers = [];
    
    snapshot.forEach(doc => {
      const dossierData = doc.data();
      dossiers.push({
        id: doc.id,
        ...dossierData,
        // Convertir les timestamps Firestore en format lisible
        createdAt: dossierData.createdAt?.toDate?.() || dossierData.createdAt,
        controlePeriodiqueDate: dossierData.controlePeriodiqueDate?.toDate?.() || dossierData.controlePeriodiqueDate,
      });
    });
    
    res.json({ success: true, dossiers });
  } catch (error) {
    console.error("❌ Erreur récupération dossiers:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// 🔹 NOUVEAU : Route pour obtenir un dossier spécifique avec détails complets
router.get("/:dossierId", async (req, res) => {
  try {
    const { dossierId } = req.params;
    
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Dossier introuvable" });
    }
    
    const dossierData = snapshot.data();
    
    // Enrichir avec les informations de contrôle périodique
    const enrichedDossier = {
      id: dossierId,
      ...dossierData,
      createdAt: dossierData.createdAt?.toDate?.() || dossierData.createdAt,
      controlePeriodiqueDate: dossierData.controlePeriodiqueDate?.toDate?.() || dossierData.controlePeriodiqueDate,
      // Calculer l'état de chaque produit
      produits: dossierData.produits?.map(produit => ({
        ...produit,
        controlePeriodiqueAvailable: dossierData.controlePeriodiqueDate ? 
          new Date() >= new Date(dossierData.controlePeriodiqueDate?.toDate?.() || dossierData.controlePeriodiqueDate) : false,
        daysUntilControle: dossierData.controlePeriodiqueDate ? 
          Math.max(0, Math.ceil((new Date(dossierData.controlePeriodiqueDate?.toDate?.() || dossierData.controlePeriodiqueDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0
      })) || []
    };
    
    res.json({ success: true, dossier: enrichedDossier });
  } catch (error) {
    console.error("❌ Erreur récupération dossier:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// 🔹 NOUVEAU : Route pour déclencher manuellement la notification de contrôle périodique (debug/admin)
router.post("/trigger-controle-notification/:dossierId", async (req, res) => {
  try {
    const { dossierId } = req.params;
    const { createControlePeriodiqueNotification } = require("../controllers/dossierController");
    
    await createControlePeriodiqueNotification(dossierId);
    
    res.json({ 
      success: true, 
      message: `Notification de contrôle périodique déclenchée pour le dossier ${dossierId}` 
    });
  } catch (error) {
    console.error("❌ Erreur déclenchement notification:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

module.exports = router;