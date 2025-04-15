const admin = require("firebase-admin");
const db = admin.firestore();

// 🔹 Création de compte utilisateur
const createAccount = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
  }

  const validRoles = ["Revendeur", "Carrossier"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Rôle invalide." });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    res.status(201).json({ success: true, message: "Compte créé avec succès." });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};



// 🔹 Récupération des utilisateurs non approuvés
const getUnapprovedUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("isApproved", "==", false).get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    
    return res.status(200).json({ success: true, users });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// 🔹 Validation d'un compte utilisateur
const validateAccount = async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: "UID manquant." });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    const userData = userSnapshot.data();
    await userRef.update({ isApproved: true });

    await admin.auth().setCustomUserClaims(uid, { role: userData.role, isApproved: true });

    
    return res.status(200).json({ success: true, message: "Compte validé avec succès." });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


// 🔹 Connexion utilisateur
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const userClaims = userRecord.customClaims || {};

    if (!userClaims.isApproved) {
      return res.status(403).json({ success: false, message: "Compte en attente de validation." });
    }

    // Récupération des infos utilisateur
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    // Générer un token Firebase (le client l'utilisera pour s'authentifier)
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({
      success: true,
      token,
      user: userDoc.data(),
      message: "Connexion réussie.",
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};



// 🔹 Réinitialisation du mot de passe
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requis." });
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    return res.status(200).json({
      success: true,
      message: "Lien de réinitialisation envoyé avec succès.",
    });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// 🔹 Suppression d'un compte utilisateur
const deleteAccount = async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ success: false, message: "UID manquant." });
  }

  try {
    await admin.auth().deleteUser(uid);
    await db.collection("users").doc(uid).delete();

    return res.status(200).json({ success: true, message: "Compte supprimé avec succès." });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// 🔹 Récupération des utilisateurs approuvés
const getApprovedUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("isApproved", "==", true).get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, users });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


// 🔹 Création de compte utilisateur
const connexion = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requis." });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const customClaims = userRecord.customClaims || {};

    if (!customClaims.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Votre compte est en attente de validation.",
      });
    }

    if (customClaims.role !== "Revendeur") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé pour ce rôle.",
      });
    }

    return res.status(200).json({
      success: true,
      role: customClaims.role,
      isApproved: customClaims.isApproved,
      message: "Connexion réussie.",
    });
  } catch (error) {
    
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


// 🔹 Récupération des utilisateurs par rôle
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  if (!role) {
    return res.status(400).json({ success: false, message: "Rôle manquant." });
  }

  try {
    const snapshot = await db.collection("users").where("role", "==", role).get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "Aucun utilisateur trouvé pour ce rôle." });
    }

    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, users });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

module.exports = {
  createAccount,
  getUnapprovedUsers,
  validateAccount,
  forgotPassword,
  login,
  deleteAccount,
  getApprovedUsers,
  getUsersByRole,
};