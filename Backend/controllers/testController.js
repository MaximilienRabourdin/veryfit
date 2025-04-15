const { db } = require("../config/db");

// Exemple : Ajouter un document dans Firestore
exports.addDocument = async (req, res) => {
  const { collectionName, data } = req.body;

  if (!collectionName || !data) {
    return res.status(400).json({ message: "Les champs collectionName et data sont requis." });
  }

  try {
    const result = await db.collection(collectionName).add(data);
    res.status(201).json({ message: "Document ajouté avec succès.", documentId: result.id });
  } catch (error) {
    console.error("Erreur lors de l'ajout du document :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
