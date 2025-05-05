const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("../config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const products = [
  // VAT RETROFIT
  { id: "vat-bois", name: "FIT VAT BOIS", categorie: "VAT" },
  { id: "vat-cc", name: "FIT VAT CC", categorie: "VAT" },
  { id: "vat-forty", name: "FIT VAT FORTY", categorie: "VAT" },
  { id: "vat-rr", name: "FIT VAT RR", categorie: "VAT" },
  { id: "vat-husky", name: "FIT VAT HUSKY", categorie: "VAT" },

  // CLEVER RETROFIT
  { id: "clever-bois", name: "FIT CLEVER BOIS", categorie: "RETROFIT" },
  { id: "clever-cc", name: "FIT CLEVER CC", categorie: "RETROFIT" },
  { id: "clever-forty", name: "FIT CLEVER FORTY", categorie: "RETROFIT" },
  { id: "clever-rr", name: "FIT CLEVER RR", categorie: "RETROFIT" },
  { id: "clever-husky", name: "FIT CLEVER HUSKY", categorie: "RETROFIT" },

  // CLEVER SAFE
  { id: "clever-safe-bois", name: "FIT CLEVER SAFE BOIS", categorie: "SAFE" },
  { id: "clever-safe-cc", name: "FIT CLEVER SAFE CC", categorie: "SAFE" },
  { id: "clever-safe-forty", name: "FIT CLEVER SAFE FORTY", categorie: "SAFE" },
  { id: "clever-safe-rr", name: "FIT CLEVER SAFE RR", categorie: "SAFE" },
  { id: "clever-safe-husky", name: "FIT CLEVER SAFE HUSKY", categorie: "SAFE" },
];

async function recreateProducts() {
  const productsRef = db.collection("products");

  console.log("🚨 Suppression des anciens produits...");
  const snapshot = await productsRef.get();
  const batchDelete = db.batch();
  snapshot.forEach((doc) => batchDelete.delete(doc.ref));
  await batchDelete.commit();

  console.log("✅ Produits supprimés. Réécriture des nouveaux produits...");

  const batchWrite = db.batch();
  products.forEach((product) => {
    const ref = productsRef.doc(product.id);
    batchWrite.set(ref, {
      name: product.name,
      categorie: product.categorie,
    });
  });

  await batchWrite.commit();
  console.log(`✅ ${products.length} produit(s) recréé(s) dans Firestore.`);
}

recreateProducts().then(() => process.exit()).catch(console.error);
