// normaliseCategories.js
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function normalizeCategories() {
  const snapshot = await db.collection("products").get();

  const updates = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const originalCat = data.categorie || "";
    const originalName = data.name || "";

    const normalizedCat = originalCat.trim().toUpperCase();
    const normalizedName = originalName.trim();

    // Cas spéciaux : convertir SAFE → CLEVER SAFE
    let finalCat = normalizedCat;
    if (normalizedCat === "SAFE") finalCat = "CLEVER SAFE";

    // Ne mettre à jour que si nécessaire
    if (finalCat !== originalCat || normalizedName !== originalName) {
      console.log(`🔧 Correction : ${originalName} -> ${normalizedName}, cat: ${originalCat} -> ${finalCat}`);
      updates.push(
        doc.ref.update({
          categorie: finalCat,
          name: normalizedName,
        })
      );
    }
  });

  await Promise.all(updates);
  console.log(`✅ ${updates.length} produit(s) mis à jour.`);
}

normalizeCategories().catch(console.error);
