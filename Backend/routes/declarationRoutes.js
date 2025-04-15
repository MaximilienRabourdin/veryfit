const express = require("express");
const router = express.Router();
const { generateDeclarationPDF } = require("../controllers/declarationController");

// 🔹 Route POST : Génération avec données reçues
router.post("/generate-pdf/:dossierId", async (req, res) => {
  try {
    const { dossierId } = req.params;
    const formData = req.body;

    const url = await generateDeclarationPDF({ dossierId, formData });
    res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("❌ Erreur lors de la génération du PDF :", error);
    res.status(500).json({ success: false, message: "Échec génération PDF" });
  }
});

// 🔹 Route POST classique (autre forme, peut être appelée depuis le front)
router.post("/generate-declaration", async (req, res) => {
  try {
    const { orderId, formData } = req.body;

    const url = await generateDeclarationPDF({ dossierId: orderId, formData });
    res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("❌ Erreur lors de la génération du PDF :", error);
    res.status(500).json({ success: false, message: "Échec génération PDF" });
  }
});

module.exports = router;
