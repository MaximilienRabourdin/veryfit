import React from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  // Fonction pour déconnecter l'utilisateur et nettoyer les données locales
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Déconnecte l'utilisateur de Firebase
      localStorage.clear(); // Supprime les données locales obsolètes
      sessionStorage.clear(); // Si des données sont stockées dans sessionStorage
      navigate("/"); // Redirige vers la page de connexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert("Une erreur s'est produite lors de la déconnexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">Merci !</h1>
      <p className="text-lg mt-4 text-center">
        Votre compte est en attente de validation par un administrateur. 
        Veuillez réessayer ultérieurement ou contacter l'administrateur pour plus d'informations.
      </p>
      <button
        onClick={handleLogout}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default Unauthorized;
