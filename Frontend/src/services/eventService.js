import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import db from "../firebaseConfig";

/**
 * Récupère tous les événements pour une date spécifique.
 * @param {string} date - Date au format "YYYY-MM-DD".
 */
export const fetchEventsByDate = async (date) => {
  const eventsCollection = collection(db, "events");
  const q = query(eventsCollection, where("date", "==", date));
  const eventsSnapshot = await getDocs(q);
  return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Ajoute un nouvel événement à la collection Firestore.
 * @param {Object} event - Données de l'événement à ajouter.
 */
export const addEvent = async (event) => {
  const eventsCollection = collection(db, "events");
  await addDoc(eventsCollection, event);
};
