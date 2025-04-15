const admin = require("firebase-admin");

const setUserRole = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ success: false, message: "Email et rôle requis." });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().setCustomUserClaims(user.uid, { role });

    res.status(200).json({ success: true, message: "Rôle attribué avec succès." });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { setUserRole };
