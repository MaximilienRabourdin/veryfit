const express = require("express");
const path = require("path");
const fs = require("fs");
const { upload } = require("../services/uploadService");
const { db } = require("../config/firebaseAdmin");
const { sendNotificationToFit } = require("../controllers/dossierController");

const cors = require("cors");


const router = express.Router();

router.post(
  "/upload/declaration-montage",
  cors({
    origin: ["http://localhost:3000", "https://veryfit.vercel.app"],
    credentials: true,
  }),
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    const orderId = req.body.orderId;
    const produitId = req.body.produitId;

    if (!file || !orderId || !produitId) {
      return res.status(400).json({ error: "Fichier, ID dossier ou produit manquant." });
    }

    try {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      const dossierRef = db.collection("dossiers").doc(orderId);
      const docSnap = await dossierRef.get();

      if (!docSnap.exists) return res.status(404).json({ error: "Dossier introuvable." });

      await dossierRef.update({
        produits: docSnap.data().produits.map((p) =>
          p.productId === produitId
            ? {
                ...p,
                documents: {
                  ...p.documents,
                  declarationMontage: {
                    url: fileUrl,
                    createdAt: new Date().toISOString(),
                  },
                },
              }
            : p
        ),
      });

      await sendNotificationToFit({
        type: "declarationMontage",
        dossierId: orderId,
        produitId,
        message: `🧾 Déclaration de montage reçue pour le dossier "${dossier.orderName}" - Destinataire : ${dossier.revendeurEmail || "non spécifié"}`,
      });

      res.json({ success: true, fileUrl });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de Firestore." });
    }
  }
);



module.exports = router;
