import { db } from "../firebaseConfig";
import { 
  collection, getDocs, addDoc, deleteDoc, query, where, doc, orderBy 
} from "firebase/firestore";

// 🔹 Récupérer toutes les commandes, triées par date de création
export const fetchOrders = async () => {
  try {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, orderBy("createdAt", "desc")); // Tri par date de création
    const ordersSnapshot = await getDocs(q);

    return ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commandes :", error.message);
    throw new Error("Impossible de récupérer les commandes.");
  }
};

// 🔹 Créer une commande
export const createOrder = async (orderData) => {
  try {
    console.log("🔎 Données envoyées à Firestore :", orderData); // 👈 Ajoute ceci

    // Vérifie que aucun champ n'est `undefined`
    const cleanedData = Object.fromEntries(
      Object.entries(orderData).filter(([_, v]) => v !== undefined)
    );

    const ordersCollection = collection(db, "orders");
    const docRef = await addDoc(ordersCollection, cleanedData);
    console.log("✅ Commande créée avec succès :", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la commande :", error.message);
    throw new Error("Impossible de créer la commande.");
  }
};


// 🔹 Supprimer une commande
export const deleteOrder = async (orderId) => {
  try {
    const orderDoc = doc(db, "orders", orderId);
    await deleteDoc(orderDoc);
    console.log("🗑️ Commande supprimée :", orderId);
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la commande :", error.message);
    throw new Error("Impossible de supprimer la commande.");
  }
};

// 🔹 Récupérer les commandes d'un revendeur spécifique
export const fetchOrdersByRevendeur = async (revendeurId) => {
  try {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, where("revendeur", "==", revendeurId), orderBy("createdAt", "desc"));
    const ordersSnapshot = await getDocs(q);

    return ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commandes du revendeur :", error.message);
    throw new Error("Impossible de récupérer les commandes du revendeur.");
  }
};

// 🔹 Alias pour `createOrder` en tant que `addOrder` (cohérence avec FitCreateOrder)
export { createOrder as addOrder };
