// routes/uploadConformitePDF.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getFirestore } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const upload = multer({ storage: multer.memoryStorage() });
const db = getFirestore();

router.post("/upload/conformite-ce", upload.single("file"), async (req, res) => {
  try {
    const { orderId } = req.body;
    const file = req.file;

    if (!file || !orderId) {
      return res.status(400).json({ error: "Fichier ou ID dossier manquant." });
    }

    const fileId = uuidv4();
    const fileName = `conformite_${fileId}.pdf`;

    const tempPath = path.join(__dirname, "..", "temp", fileName);
    fs.writeFileSync(tempPath, file.buffer);

    // Simuler un stockage local ou temporaire (peut être remplacé par GCS, Firebase Storage)
    const downloadUrl = `/files/${fileName}`;

    await db.collection("orders").doc(orderId).update({
      "dossierCE.declarationCE": {
        fileName,
        url: downloadUrl,
        uploadedAt: new Date().toISOString(),
      },
    });

    res.json({ message: "Fichier reçu", fileName, url: downloadUrl });
  } catch (error) {
    
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
