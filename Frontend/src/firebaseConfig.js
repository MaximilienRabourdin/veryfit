import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDt3Kyg6Zbuo6BFB1NAGttMxbCjFmeOGXo",
  authDomain: "fitdoorswebapp-79538.firebaseapp.com",
  projectId: "fitdoorswebapp-79538",
  storageBucket: "fitdoorswebapp-79538.appspot.com",
  messagingSenderId: "649444765511",
  appId: "1:649444765511:web:50563f55914e04a6f52662"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
const auth = getAuth(app);

// ✅ Activation de la persistance
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Erreur de persistance Firebase Auth :", error);
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
