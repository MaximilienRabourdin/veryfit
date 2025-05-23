const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json"); // Assurez-vous que le chemin est correct

// Initialisation de Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Fonction de migration
async function migrateRevendeursToUsers() {
  try {
    

    const revendeursSnapshot = await db.collection("revendeurs").get();

    if (revendeursSnapshot.empty) {
      
      return;
    }

    const batch = db.batch();

    revendeursSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;

      const userRef = db.collection("users").doc(userId);
      batch.set(userRef, {
        ...data,
        role: "Revendeur", // Ajout du rôle spécifique
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    
  } catch (error) {
    
  }
}

if (require.main === module) {
  migrateRevendeursToUsers();
}

module.exports = { migrateRevendeursToUsers };
