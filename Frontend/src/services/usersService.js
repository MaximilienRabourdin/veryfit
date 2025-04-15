import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Remplacez par l'URL de votre backend déployé si nécessaire

// 🔹 Récupérer les utilisateurs par rôle
export const getUsersByRole = async (role) => {
  try {
    const response = await axios.get(`${API_URL}/users/${role}`);
    return response.data.users; // Assurez-vous que votre backend retourne un tableau d'utilisateurs
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs pour le rôle ${role} :`, error);
    throw error;
  }
};

// 🔹 Ajouter un nouvel utilisateur
export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/create-account`, userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    throw error;
  }
};

// 🔹 Supprimer un utilisateur
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/delete-account/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${userId} :`, error);
    throw error;
  }
};
