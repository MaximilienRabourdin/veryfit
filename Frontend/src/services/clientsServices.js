import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Récupérer les clients
export const fetchClients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error);
    throw error;
  }
};
