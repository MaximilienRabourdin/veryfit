const { db } = require("../config/firebaseAdmin");

// 🔹 Récupérer tous les produits
const getAllProducts = async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    if (snapshot.empty) {
      return res.status(404).json({ msg: "Aucun produit trouvé" });
    }

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des produits :", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};

// 🔹 Récupérer un produit spécifique
const getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const productDoc = await db.collection("products").doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du produit :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Récupérer le formulaire d'un produit spécifique
const getProductForm = async (req, res) => {
  const { productId } = req.params;
  try {
    const productDoc = await db.collection("products").doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json({ form: productDoc.data().form || null });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// Export des fonctions
module.exports = { getAllProducts, getProductById, getProductForm };
