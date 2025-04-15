const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

// Route pour récupérer les formulaires dynamiques pour un rôle
router.get("/getForms/:role", async (req, res) => {
  const { role } = req.params;

  try {
    const docRef = db.collection("formTemplates").doc(role);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: `Aucun formulaire trouvé pour le rôle : ${role}`,
      });
    }

    const forms = doc.data().forms || [];
    res.status(200).json({
      success: true,
      message: "Formulaires récupérés avec succès.",
      forms,
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Erreur interne lors de la récupération des formulaires.",
    });
  }
});

// Route pour récupérer un formulaire dynamique par produit
router.get("/:productName", async (req, res) => {
  const { productName } = req.params;

  try {
    const formDoc = await db.collection("dynamicForms").doc(productName).get();

    if (!formDoc.exists) {
      return res.status(404).json({ success: false, message: "Formulaire introuvable." });
    }

    res.status(200).json({ success: true, form: formDoc.data() });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.post("/submit", async (req, res) => {
  const { productName, userId, formData } = req.body;

  try {
    await db.collection("formSubmissions").add({
      productName,
      userId,
      formData,
      submittedAt: new Date(),
    });
    res.status(200).json({ success: true, message: "Formulaire soumis avec succès." });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
});

module.exports = router;
