// Backend/scripts/products-controle-periodique.js
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

const products = [
  // VAT RETROFIT
  { id: "vat-bois", name: "FIT VAT BOIS", categorie: "VAT" },
  { id: "vat-cc", name: "FIT VAT CC", categorie: "VAT" },
  { id: "vat-forty", name: "FIT VAT FORTY", categorie: "VAT" },
  { id: "vat-husky", name: "FIT VAT HUSKY", categorie: "VAT" },
  { id: "vat-rr", name: "FIT VAT RR", categorie: "VAT" },

  // CLEVER RETROFIT
  { id: "clever-bois", name: "FIT CLEVER BOIS", categorie: "RETROFIT" },
  { id: "clever-cc", name: "FIT CLEVER CC", categorie: "RETROFIT" },
  { id: "clever-forty", name: "FIT CLEVER FORTY", categorie: "RETROFIT" },
  { id: "clever-husky", name: "FIT CLEVER HUSKY", categorie: "RETROFIT" },
  { id: "clever-rr", name: "FIT CLEVER RR", categorie: "RETROFIT" },

  // CLEVER SAFE
  { id: "clever-safe-bois", name: "FIT CLEVER SAFE BOIS", categorie: "SAFE" },
  { id: "clever-safe-cc", name: "FIT CLEVER SAFE CC", categorie: "SAFE" },
  { id: "clever-safe-forty", name: "FIT CLEVER SAFE FORTY", categorie: "SAFE" },
  { id: "clever-safe-husky", name: "FIT CLEVER SAFE HUSKY", categorie: "SAFE" },
  { id: "clever-safe-rr", name: "FIT CLEVER SAFE RR", categorie: "SAFE" },
];

(async () => {
  try {
    for (const product of products) {
      await db
        .collection("products-controle-periodique")
        .doc(product.id)
        .set({
          name: product.name,
          categorie: product.categorie,
        });
      console.log(`✅ Ajouté : ${product.name}`);
    }

    console.log("🎉 Tous les produits ont été ajoutés dans 'products-controle-periodique'.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error);
    process.exit(1);
  }
})();
