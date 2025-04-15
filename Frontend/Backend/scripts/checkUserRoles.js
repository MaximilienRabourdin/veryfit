const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

const emails = [
  "kdjoubri@fit-doors.fr",
  "ogrisat@fit-doors.fr",
  "elanglais@fit-doors.fr",
  "info@fit-doors.fr",
];

const checkRoles = async () => {
  try {
    for (const email of emails) {
      const user = await auth.getUserByEmail(email);
      
      
    }
  } catch (error) {
    
  }
};

checkRoles();
