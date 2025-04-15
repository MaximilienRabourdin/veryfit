import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Fonction pour envoyer une notification à Firestore.
 * @param {string} message - Message de la notification.
 * @param {string} userId - Identifiant de l'utilisateur à qui la notification est destinée.
 */
export const sendNotification = async (message, userId) => {
  if (!message || !userId) {
    console.error("Message ou userId manquant pour envoyer la notification.");
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      message,
      userId,
      read: false,
      createdAt: serverTimestamp(), // Utilisation de serverTimestamp pour une date synchronisée
    });
    console.log("Notification envoyée avec succès :", { message, userId });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification :", error);
  }
};
