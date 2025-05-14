const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const companyRoleMap = {
  "ATLANTIC TRUCK SERVICES": "Carrossier",
  "AUBINEAU CONSTRUCTEUR": "Carrossier",
  "CARROSSERIE INDUST BAIN": "Carrossier",
  "CARROSSERIE BARRE": "Carrossier",
  "SAS BAYI TRUCKS LE MANS": "Carrossier",
  "THE TRUCK COMPANY FRANCE": "Carrossier",
  "BLIN CARROSSERIE": "Carrossier",
  "BOYRITEC": "Revendeur",
  "CARFAR": "Carrossier",
  "CAVIME": "Carrossier",
  "JEAN CHEREAU SAS": "Carrossier",
  "CARROSSERIE CORSIN": "Carrossier",
  "DHUME CARROSSERIE": "Carrossier",
  "DUFILS CARROSSERIE": "Carrossier",
  "GROSSE EQUIPEMENT": "Carrossier",
  "ITAL EXPRESS": "Revendeur",
  "CARROSSERIE LABBE": "Carrossier",
  "SAS LALOYEAU SERVICES": "Carrossier",
  "LAMBERT SAS": "Carrossier",
  "DFCI LANGLAIS": "Carrossier",
  "CARROSSERIE LEBRUN": "Carrossier",
  "LECTRAILER FRANCE SARL": "Carrossier",
  "LECTRAILER SA": "Carrossier",
  "CARROSSERIE INDUST LEMAIRE": "Carrossier",
  "LE ROUIC SARL": "Carrossier",
  "LIBNER": "Carrossier",
  "CRETOT LOCATION": "Revendeur",
  "MOLETTA OBRADO CARROSSERIE": "Carrossier",
  "J RENAULT SAS": "Carrossier",
  "SOR IBERICA": "Carrossier",
  "TEKNOKIT FRANCE": "Revendeur",
  "TOUTAIN CARROSSERIE SAS": "Carrossier",
  "VIVIER CARROSSERIE": "Carrossier"
};

const updateRoles = async () => {
  const snapshot = await db.collection("users_webapp").get();
  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    const company = data.company;
    const role = companyRoleMap[company];
    if (role && data.role !== role) {
      console.log(`🔄 Updating ${company} to role ${role}`);
      batch.update(doc.ref, { role });
    }
  });

  await batch.commit();
  console.log("✅ Mise à jour des rôles terminée.");
};

updateRoles().catch(console.error);
