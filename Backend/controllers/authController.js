// ✅ Fichier : controllers/authController.js
const admin = require("firebase-admin");
const db = admin.firestore();

const createAccount = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
  }

  const validRoles = ["Revendeur", "Carrossier", "Utilisateur"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Rôle invalide." });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role, isApproved: true });

    await db.collection("users_webapp").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role,
      isApproved: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: "Compte créé avec succès." });
  } catch (error) {
    console.error("Erreur createAccount:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getUnapprovedUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users_webapp").where("isApproved", "==", false).get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erreur getUnapprovedUsers:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const validateAccount = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ success: false, message: "UID manquant." });

  try {
    const userRef = db.collection("users_webapp").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    const userData = userSnapshot.data();
    await userRef.update({ isApproved: true });
    await admin.auth().setCustomUserClaims(uid, {
      role: userData.role,
      isApproved: true,
    });

    return res.status(200).json({ success: true, message: "Compte validé avec succès." });
  } catch (error) {
    console.error("Erreur validateAccount:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email requis." });

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    return res.status(200).json({ success: true, message: "Lien de réinitialisation envoyé." });
  } catch (error) {
    console.error("Erreur forgotPassword:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const deleteAccount = async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ success: false, message: "UID manquant." });

  try {
    await admin.auth().deleteUser(uid);
    await db.collection("users_webapp").doc(uid).delete();
    return res.status(200).json({ success: true, message: "Compte supprimé avec succès." });
  } catch (error) {
    console.error("Erreur deleteAccount:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getApprovedUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users_webapp").where("isApproved", "==", true).get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erreur getApprovedUsers:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getUsersByRole = async (req, res) => {
  const { role } = req.params;
  if (!role) return res.status(400).json({ success: false, message: "Rôle manquant." });

  try {
    const snapshot = await db.collection("users_webapp").where("role", "==", role).get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    if (!users.length) {
      return res.status(404).json({ success: false, message: "Aucun utilisateur trouvé." });
    }

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erreur getUsersByRole:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  createAccount,
  getUnapprovedUsers,
  validateAccount,
  forgotPassword,
  deleteAccount,
  getApprovedUsers,
  getUsersByRole,
};