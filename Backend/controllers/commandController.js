const { db } = require("../firebaseConfig");

exports.updateCommandStatus = async (req, res) => {
  const { commandId, status } = req.body;

  try {
    const commandRef = db.collection("orders").doc(commandId);
    await commandRef.update({ status });

    res.status(200).json({ message: "Statut mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
  }
};
