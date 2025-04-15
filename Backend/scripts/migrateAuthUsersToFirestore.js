const { admin, db } = require("../config/firebaseAdmin"); // Mise à jour ici

const usersToMigrate = [
  { email: "kdjoubri@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "ogrisat@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "elanglais@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "info@fit-doors.fr", role: "Admin", isApproved: true },
];

const migrateAuthUsersToFirestore = async () => {
  try {
    

    for (const user of usersToMigrate) {
      

      // Utilisez admin.auth() pour récupérer l'utilisateur
      const userRecord = await admin.auth().getUserByEmail(user.email);

      // Ajoutez l'utilisateur à Firestore
      const userData = {
        uid: userRecord.uid,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("users").doc(userRecord.uid).set(userData, { merge: true });
      
    }

    
  } catch (error) {
    
  }
};

migrateAuthUsersToFirestore();
