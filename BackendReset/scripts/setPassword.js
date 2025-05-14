const admin = require("../config/firebaseAdmin").admin;

const setPassword = async (email, newPassword) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: newPassword });
    
  } catch (error) {
    
  }
};

setPassword("kdjoubri@fit-doors.fr", "NewPassword123");
