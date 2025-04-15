const { db } = require("../config/db");

// Récupérer les statistiques principales
exports.getStats = async (req, res) => {
  try {
    const ordersSnapshot = await db.collection("orders").get();
    const orders = ordersSnapshot.docs.map((doc) => doc.data());

    // Calcul des statistiques
    const stats = {
      declarationsToValidate: orders.filter((order) => order.status === "à valider").length,
      declarationsRefused: orders.filter((order) => order.status === "refusé").length,
      declarationsToDeclare: orders.filter((order) => order.status === "à déclarer").length,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
