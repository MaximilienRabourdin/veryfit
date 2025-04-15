// src/services/revendeurService.js
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const fetchRevendeurs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users_webapp"));
    const revendeurs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        company: data.company || data.Nom || data.nom || "Nom inconnu",     
        contact: data.contact || data.Contact || "Contact inconnu",    
        email: data.email || "",
        role: data.role || "",
      };
    });

    console.log("📌 Revendeurs récupérés :", revendeurs);
    return revendeurs;
  } catch (error) {
    console.error("🚨 Erreur lors de la récupération des revendeurs :", error);
    return [];
  }
};
