const { admin, db } = require("../config/firebaseAdmin"); // Mise à jour ici

const usersToMigrate = [
  { email: "kdjoubri@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "ogrisat@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "elanglais@fit-doors.fr", role: "Super Admin", isApproved: true },
  { email: "info@fit-doors.fr", role: "Admin", isApproved: true },
];

const migrateAuthUsersToFirestore = async () => {
  try {
    console.log("Début de la migration des utilisateurs...");

    for (const user of usersToMigrate) {
      console.log(`Traitement de l'utilisateur : ${user.email}`);

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
      console.log(`Utilisateur ajouté à Firestore : ${user.email}`);
    }

    console.log("Migration terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la migration des utilisateurs :", error);
  }
};

migrateAuthUsersToFirestore();
