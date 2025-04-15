const admin = require("firebase-admin");
const { db } = require("../config/firebaseAdmin");

// Fonction principale pour créer un utilisateur avec un rôle
const createUserWithRole = async ({ email, password, displayName, role }) => {
  if (!email || !password || !role) {
    throw new Error("Email, mot de passe et rôle sont obligatoires.");
  }

  try {
    // 1. Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const uid = userRecord.uid;

    // 2. Définir les Custom Claims pour gérer les rôles
    await admin.auth().setCustomUserClaims(uid, {
      role,
      isApproved: true,
    });

    

    // 3. Enregistrer l'utilisateur dans Firestore (optionnel)
    await db.collection("users_webapp").doc(uid).set({
      uid,
      email,
      displayName,
      role,
      isApproved: true,
      createdAt: new Date(),
    });

    return {
      success: true,
      uid,
      email,
      displayName,
      role,
    };
  } catch (error) {
    
    throw error;
  }
};

module.exports = { createUserWithRole };
