// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase de ton projet
const firebaseConfig = {
  apiKey: "AIzaSyDt3Kyg6Zbuo6BFB1NAGttMxbCjFmeOGXo",
  authDomain: "fitdoorswebapp-79538.firebaseapp.com",
  projectId: "fitdoorswebapp-79538",
  storageBucket: "fitdoorswebapp-79538.appspot.com", // 👈 correction ici : ".app" → ".app**spot.com**"
  messagingSenderId: "649444765511",
  appId: "1:649444765511:web:50563f55914e04a6f52662"
};

// Évite les conflits d'initialisation Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export de Firestore
const db = getFirestore(app);

export { db };
