const admin = require("firebase-admin");
const { db } = require("../config/firebaseAdmin");

const createUserWithRole = async ({ email, password, displayName, role = "Utilisateur" }) => {
  if (!email || !password || !role) {
    throw new Error("Email, mot de passe et rôle requis.");
  }

  try {
    // 🔹 Création de l'utilisateur Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // 🔹 Définition immédiate des custom claims (role + approbation)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role,
      isApproved: true,
    });

    // 🔹 Sauvegarde dans Firestore (collection users_webapp)
    await db.collection("users_webapp").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      isApproved: true,
      createdAt: new Date(),
    });

    // 🔎 Vérification des claims immédiatement après création
    const refreshedUser = await admin.auth().getUser(userRecord.uid);
    const claims = refreshedUser.customClaims || {};
    console.log("✅ Claims définis pour", userRecord.uid, ":", claims);

    return {
      success: true,
      uid: userRecord.uid,
      email,
      displayName,
      role,
    };
  } catch (error) {
    console.error("❌ Erreur createUserWithRole:", error);
    throw error;
  }
};

module.exports = { createUserWithRole };
