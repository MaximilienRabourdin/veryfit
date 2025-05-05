const { db } = require("../config/firebaseAdmin");

const nouveauxProduits = [
  { name: "Fit vat bois", categorie: "VAT RETROFIT" },
  { name: "Vat CC", categorie: "VAT RETROFIT" },
  { name: "FORTY", categorie: "VAT RETROFIT" },
  { name: "RR", categorie: "VAT RETROFIT" },
  { name: "HUSKY", categorie: "VAT RETROFIT" },
  { name: "BOIS", categorie: "CLEVER RETROFIT" },
  { name: "CC", categorie: "CLEVER RETROFIT" },
  { name: "FORTY", categorie: "CLEVER RETROFIT" },
  { name: "RR", categorie: "CLEVER RETROFIT" },
  { name: "HUSKY", categorie: "CLEVER RETROFIT" },
];

const updateExistingProductsToSafe = async () => {
  const snapshot = await db.collection("products").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const ref = db.collection("products").doc(doc.id);
    batch.update(ref, { categorie: "SAFE" });
  });

  await batch.commit();
  console.log("✅ Tous les produits existants ont maintenant la catégorie 'SAFE'");
};

const addNewProducts = async () => {
  for (const produit of nouveauxProduits) {
    await db.collection("products").add({
      name: produit.name,
      categorie: produit.categorie,
      createdAt: new Date(),
    });
    console.log(`✅ Produit ajouté : ${produit.name}`);
  }
};

(async () => {
  try {
    await updateExistingProductsToSafe();
    await addNewProducts();
    console.log("🎉 Mise à jour terminée.");
    process.exit(0);
  } catch (err) {
    console.error("🚨 Erreur :", err);
    process.exit(1);
  }
})();
