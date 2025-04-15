const { db } = require("../config/firebaseAdmin");

async function exportProducts() {
  const productsSnapshot = await db.collection("products").get();
  const products = [];
  productsSnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  );
}

exportProducts();
