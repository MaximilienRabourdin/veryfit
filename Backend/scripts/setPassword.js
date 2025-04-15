const admin = require("../config/firebaseAdmin").admin;

const setPassword = async (email, newPassword) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: newPassword });
    console.log(`Mot de passe mis à jour pour : ${email}`);
  } catch (error) {
    console.error(`Erreur pour ${email} :`, error.message);
  }
};

setPassword("kdjoubri@fit-doors.fr", "NewPassword123");
