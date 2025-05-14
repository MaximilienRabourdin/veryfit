const { db } = require("../config/firebaseAdmin");

const entries = [
  {
    name: "VAT Forty",
    categorie: "ROUGE",
  },
  {
    name: "Husky",
    categorie: "SAFE",
  },
  {
    name: "CC",
    categorie: "ROUGE",
  },
  {
    name: "RR",
    categorie: "ROUGE",
  },
  {
    name: "Bois",
    categorie: "ROUGE",
  },
];

const createControlePeriodiqueEntry = async () => {
  try {
    const batch = db.batch();
    const collectionRef = db.collection("products-controle-periodique");

    for (const entry of entries) {
      const docRef = collectionRef.doc(); // auto ID
      batch.set(docRef, {
        name: entry.name,
        categorie: entry.categorie,
        createdAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    console.log("✅ Collection 'products-controle-periodique' créée avec succès.");
  } catch (err) {
    console.error("❌ Erreur lors de la création :", err);
  }
};

createControlePeriodiqueEntry();
