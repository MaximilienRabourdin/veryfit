import { useEffect } from "react";
import { auth } from "../firebaseConfig"; // Assure-toi que le bon chemin est utilisé

const GetFirebaseToken = () => {
  useEffect(() => {
    const fetchToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        console.log("🔑 Token Firebase :", token);
      } else {
        console.warn("🚨 Aucun utilisateur connecté !");
      }
    };

    fetchToken();
  }, []);

  return null; // Ce composant ne rend rien
};

export default GetFirebaseToken;
