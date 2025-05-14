const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../config/firebase-service-key.json"); 

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

async function approveUsers() {
  const roles = ["Revendeur", "Carrossier"];

  for (const role of roles) {
    const snapshot = await db
      .collection("users_webapp")
      .where("role", "==", role)
      .get();

    console.log(`🔎 ${snapshot.size} utilisateur(s) avec le rôle "${role}"`);

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.isApproved !== true) {
        console.log(`✅ Ajout de isApproved:true à ${data.company || doc.id}`);
        batch.update(doc.ref, { isApproved: true });
      }
    });

    await batch.commit();
    console.log(`✅ Tous les utilisateurs "${role}" ont été approuvés`);
  }

  console.log("🎉 Script terminé.");
}

approveUsers().catch((err) => {
  console.error("❌ Erreur dans approveUsers:", err);
});
