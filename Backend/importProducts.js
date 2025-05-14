const admin = require("firebase-admin");
const products = require("../data/products.json"); // Assure-toi que le fichier JSON est au bon endroit

// Initialisation de Firebase Admin
const serviceAccount = require("./config/firebase-service-key.json"); // Remplace par le bon chemin de ta clé

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const importProducts = async () => {
  try {
    const batch = db.batch();
    const productsCollection = db.collection("products");

    products.forEach((product, index) => {
      const docRef = productsCollection.doc(`product_${index + 1}`);
      batch.set(docRef, {
        name: product.name, // Utilise le nom des produits du JSON
      });
    });

    await batch.commit();
  } catch (error) {
  }
};

importProducts();
