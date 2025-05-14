const { db } = require("../config/db");

// Ajouter une demande de suppression
exports.createDeletionRequest = async (req, res) => {
  const { requested_by, target_id, target_type } = req.body;

  try {
    await db.collection("deletion_requests").add({
      requested_by,
      target_id,
      target_type,
      status: "pending",
      comment: "",
      reviewed_by: null,
      timestamp: new Date(),
    });
    res.status(201).json({ message: "Demande de suppression créée avec succès !" });
  } catch (error) {
    
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer toutes les demandes
exports.getDeletionRequests = async (req, res) => {
  const { status } = req.query;

  try {
    let query = db.collection("deletion_requests");
    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();
    const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(requests);
  } catch (error) {
    
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Mettre à jour une demande de suppression
exports.updateDeletionRequest = async (req, res) => {
  const { id } = req.params;
  const { status, comment, reviewed_by } = req.body;

  try {
    const requestRef = db.collection("deletion_requests").doc(id);
    await requestRef.update({
      status,
      comment,
      reviewed_by,
      timestamp: new Date(),
    });
    res.status(200).json({ message: "Demande mise à jour avec succès !" });
  } catch (error) {
    
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
