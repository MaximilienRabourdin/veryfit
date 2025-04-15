const { db } = require("../config/firebaseAdmin");

// 🔹 Récupération des commandes d'un revendeur
const getRevendeurOrders = async (req, res) => {
  try {
    const userEmail = req.user.email; // 🔹 Email récupéré du token
    console.log("🔍 Recherche des commandes pour l'email :", userEmail);

    const ordersRef = db.collection("orders").where("orderName", "==", userEmail);
    const snapshot = await ordersRef.get();

    if (snapshot.empty) {
      console.warn("⚠ Aucune commande trouvée pour cet utilisateur !");
      return res.json({ success: true, orders: [] });
    }

    let orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    console.log("✅ Commandes trouvées :", orders);
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commandes :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};



// 🔹 Récupération d'une commande par ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "ID de commande manquant." });

    console.log(`🔍 Récupération de la commande ID: ${orderId}`);

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Commande non trouvée." });
    }

    res.status(200).json({ success: true, order: orderDoc.data() });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commande :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { getRevendeurOrders, getOrderById };
