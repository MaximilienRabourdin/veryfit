const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { initializeApp } = require("firebase/app");

// Remplace ces informations par celles de ta configuration Firebase
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fonction pour récupérer un token
const getToken = async () => {
  try {
    // Remplace par les identifiants de l'utilisateur (ex : Revendeur)
    const email = "EMAIL_UTILISATEUR";
    const password = "MOT_DE_PASSE_UTILISATEUR";

    // Connexion à Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Récupération du token
    const token = await user.getIdToken();
    console.log("✅ Token récupéré :", token);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token :", error);
  }
};

// Appelle la fonction pour obtenir le token
getToken();
