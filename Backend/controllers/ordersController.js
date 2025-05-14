const { db } = require("../config/firebaseAdmin");

// 🔹 Récupération des commandes d'un revendeur
const getRevendeurOrders = async (req, res) => {
  try {
    const userEmail = req.user.email; // 🔹 Email récupéré du token
    

    const ordersRef = db.collection("orders").where("orderName", "==", userEmail);
    const snapshot = await ordersRef.get();

    if (snapshot.empty) {
      
      return res.json({ success: true, orders: [] });
    }

    let orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    
    res.json({ success: true, orders });
  } catch (error) {
    
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

    

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Commande non trouvée." });
    }

    res.status(200).json({ success: true, order: orderDoc.data() });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { getRevendeurOrders, getOrderById };
