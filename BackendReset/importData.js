const admin = require("firebase-admin");
const serviceAccount = require("./config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const clients = require("./data/Clients.json");
const products = require("./data/Gamme_machine.json");

const importData = async () => {
  try {
    // Importer les clients
    for (const client of clients) {
      await db.collection("clients").doc(client.id).set(client);
    }

    // Importer les produits
    for (const product of products) {
      await db.collection("products").doc(product.id).set(product);
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

importData();
