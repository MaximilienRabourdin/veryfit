import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const fetchUserData = async (uid) => {
  try {
    console.log("Tentative de récupération des données pour UID :", uid);
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log("Données utilisateur Firestore récupérées :", userDoc.data());
      return userDoc.data();
    } else {
      console.error("Aucune donnée utilisateur trouvée pour l'UID :", uid);
      throw new Error("Aucune donnée utilisateur trouvée.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données Firestore :", error);
    throw error;
  }
};
