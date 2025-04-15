const { db } = require("../config/db"); // Firestore configuré

// Ajouter un log
exports.createLog = async (req, res) => {
  const { user_id, action_type, target_id, target_type } = req.body;

  console.log("Requête reçue :", req.body); // Log pour afficher le contenu de la requête

  // Vérification des données envoyées
  if (!user_id || !action_type || !target_id || !target_type) {
    console.error("Données manquantes dans la requête");
    return res.status(400).json({ message: "Les champs user_id, action_type, target_id, et target_type sont requis." });
  }

  try {
    console.log("Ajout du log dans Firestore...");
    await db.collection("logs").add({
      user_id,
      action_type,
      target_id,
      target_type,
      timestamp: new Date(),
    });
    console.log("Log ajouté avec succès !");
    res.status(201).json({ message: "Log ajouté avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du log :", error); // Log de l'erreur réelle
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer tous les logs
exports.getLogs = async (req, res) => {
  try {
    const snapshot = await db.collection("logs").get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(logs);
  } catch (error) {
    console.error("Erreur lors de la récupération des logs :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
