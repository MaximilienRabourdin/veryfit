const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json"); // Clé JSON Firebase Admin SDK

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Données pour chaque rôle
const data = {
  Revendeur: {
    documents: [
      "Contrôle périodique",
      "Notice d'instruction",
    ],
    typesDePorte: [
      "FIT Clever Bois",
      "FIT VAT Clever Husky",
      "FIT VAT Clever Safe Husky",
      "FIT VAT Forty",
      "FIT VAT Husky",
      "FIT VAT RR",
      "FIT Clever CC",
      "FIT Clever Forty",
      "FIT Clever RR",
      "FIT Clever Safe Bois",
      "FIT Clever Safe CC",
      "FIT Clever Safe Forty",
      "FIT Clever Safe RR",
      "FIT VAT CC",
    ],
    forms: [
      {
        name: "Formulaire de contrôle périodique",
        products: ["FIT Clever Bois", "FIT VAT Forty"],
        link: "https://example.com/controle-periodique",
      },
      {
        name: "Notice d'instruction",
        products: ["FIT VAT Husky", "FIT Clever CC"],
        link: "https://example.com/notice-instruction",
      },
    ],
  },
  Contrôleur: {
    documents: [
      "Fiche de contrôle",
      "Guide d'entretien",
    ],
    typesDePorte: [
      "FIT VAT Husky",
      "FIT VAT RR",
      "FIT VAT CC",
      "FIT Clever RR",
    ],
    forms: [
      {
        name: "Fiche de contrôle périodique",
        products: ["FIT VAT Husky", "FIT Clever RR"],
        link: "https://example.com/controle-periodique-ctrl",
      },
    ],
  },
  Carrossier: {
    documents: [
      "Déclaration de montage",
      "Guide d'installation",
    ],
    typesDePorte: [
      "FIT VAT Forty",
      "FIT VAT CC",
      "FIT Clever Safe Forty",
    ],
    forms: [
      {
        name: "Formulaire de déclaration de montage",
        products: ["FIT VAT Forty", "FIT Clever Safe Forty"],
        link: "https://example.com/declaration-montage",
      },
    ],
  },
};

// Fonction pour ajouter ou mettre à jour les données
const seedFirestore = async () => {
  try {
    for (const [role, roleData] of Object.entries(data)) {
      // Référence au document pour chaque rôle
      const formTemplatesRef = db.collection("formTemplates").doc(role);

      // Ajouter ou mettre à jour les données
      await formTemplatesRef.set(roleData, { merge: true });
      console.log(`Données ajoutées/ajustées avec succès pour : ${role}`);
    }
    console.log("Toutes les données ont été injectées avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'injection des données :", error);
  }
};

// Exécuter le script
seedFirestore();
