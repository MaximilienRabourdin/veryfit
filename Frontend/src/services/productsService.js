import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Exportez firebaseApp depuis firebaseConfig.js


export const fetchProducts = async () => {
  try {
    const productsCol = collection(db, "products");
    const productsSnapshot = await getDocs(productsCol);
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    throw error;
  }
};
