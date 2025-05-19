const admin = require("firebase-admin");
const { db } = require("../config/firebaseAdmin");

const createUserWithRole = async ({ email, password, displayName, role = "Utilisateur" }) => {
  if (!email || !password || !role) {
    throw new Error("Email, mot de passe et rôle requis.");
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role,
      isApproved: true,
    });

    await db.collection("users_webapp").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      isApproved: true,
      createdAt: new Date(),
    });

    const updatedUser = await admin.auth().getUser(userRecord.uid);
    const claims = updatedUser.customClaims;
    console.log("✅ Claims immédiatement appliqués :", claims);

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
