const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { sendEmailToDestinataire } = require("../utils/email");

const adminConfig = require("../config/firebaseServiceAccount.json"); // ou ton init

initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

const sendRappelControlePeriodique = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const snapshot = await db
      .collection("dossiers")
      .where("controlePeriodiqueDate", ">=", today)
      .where("controlePeriodiqueDate", "<", tomorrow)
      .get();

    if (snapshot.empty) {
      console.log("📭 Aucun contrôle périodique à rappeler aujourd’hui.");
      return;
    }

    for (const doc of snapshot.docs) {
      const dossier = doc.data();
      const to = dossier.revendeurEmail;
      const orderName = dossier.orderName || doc.id;

      if (!to) continue;

      await sendEmailToDestinataire({
        to,
        dossierId: doc.id,
        orderName,
        deliveryDate: dossier.deliveryDate || "—",
        produits: dossier.produits || [],
        fichiers: {}, // pas de fichiers en pièce jointe pour ce rappel
        isRappelControle: true,
      });

      console.log(`📧 Rappel envoyé pour le dossier : ${orderName}`);
    }
  } catch (error) {
    console.error("❌ Erreur rappel contrôle périodique :", error);
  }
};

sendRappelControlePeriodique();
