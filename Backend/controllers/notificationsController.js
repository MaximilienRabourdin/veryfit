// controllers/notificationsController.js

const { getFirestore } = require("firebase-admin/firestore");

exports.sendNotification = async (req, res) => {
  const { dossierId, produitId, produitName, destinataireType } = req.body;
  const db = getFirestore();

  try {
    await db.collection("notifications").add({
      type: "formulaire_rempli",
      dossierId,
      produitId,
      produitName,
      destinataireType,
      seenByFit: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`🔔 Notification ajoutée pour FIT : ${produitName}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur notification :", err);
    res.status(500).json({ error: "Erreur envoi notification" });
  }
};
