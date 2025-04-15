const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json"); 
// Initialisation Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Définition des formulaires dynamiques pour chaque rôle
const formTemplates = {
  Revendeur: [
    {
      name: "Contrôle périodique",
      fields: [
        { label: "Coordonnées utilisateur", type: "text", required: true },
        { label: "Immatriculation", type: "text", required: true },
        { label: "Date", type: "date", required: true },
        {
          label: "Vérifications",
          type: "checklist",
          items: [
            { label: "Rails horizontaux", required: true },
            { label: "Ressorts", required: true },
          ],
        },
        { label: "Remarques", type: "textarea", required: false },
      ],
    },
  ],
  Carrossier: [
    {
      name: "Déclaration de montage",
      fields: [
        { label: "Nom de l'entreprise", type: "text", required: true },
        { label: "N° de série de la porte", type: "text", required: true },
        { label: "Immatriculation", type: "text", required: true },
        { label: "Date", type: "date", required: true },
        { label: "Signature", type: "signature", required: true },
      ],
    },
  ],
};

const seedFormTemplates = async () => {
  try {
    for (const [role, templates] of Object.entries(formTemplates)) {
      const docRef = db.collection("formTemplates").doc(role);
      await docRef.set({ forms: templates }, { merge: true });
      console.log(`Formulaires ajoutés pour ${role}`);
    }
    console.log("Tous les formulaires ont été injectés dans Firestore !");
  } catch (error) {
    console.error("Erreur lors de l'injection des formulaires :", error);
  }
};

seedFormTemplates();
