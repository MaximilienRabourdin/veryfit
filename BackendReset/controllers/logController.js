const { db } = require("../config/db"); // Firestore configuré

// Ajouter un log
exports.createLog = async (req, res) => {
  const { user_id, action_type, target_id, target_type } = req.body;

   // Log pour afficher le contenu de la requête

  // Vérification des données envoyées
  if (!user_id || !action_type || !target_id || !target_type) {
    
    return res.status(400).json({ message: "Les champs user_id, action_type, target_id, et target_type sont requis." });
  }

  try {
    
    await db.collection("logs").add({
      user_id,
      action_type,
      target_id,
      target_type,
      timestamp: new Date(),
    });
    
    res.status(201).json({ message: "Log ajouté avec succès !" });
  } catch (error) {
     // Log de l'erreur réelle
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
    
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
